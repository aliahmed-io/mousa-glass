import { createHash } from "node:crypto";
import mysql from "mysql2/promise";

if (process.env.ALLOW_STAGING_FIXTURE_SEED !== "true") {
  throw new Error("Refusing to seed fixtures without ALLOW_STAGING_FIXTURE_SEED=true.");
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed staging fixtures.");

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const fixtureCategories = [
  { slug: "fixture-glass-door-hardware", name: "إكسسوارات الأبواب الزجاجية — تجريبي", description: "فئة اختبار مولّدة لتجربة التصفية والإدارة. لا تمثل تشكيلة البيع النهائية.", sortOrder: 90 },
  { slug: "fixture-bathroom-glass", name: "ملحقات زجاج الحمام — تجريبي", description: "فئة اختبار مولّدة لتجربة التصفية والإدارة. لا تمثل تشكيلة البيع النهائية.", sortOrder: 91 },
];

const fixtures = [
  {
    slug: "fixture-pivot-hinge-180",
    categorySlug: "fixture-glass-door-hardware",
    name: "مفصلة Pivot ستانلس 180° — نموذج تجريبي",
    sku: "STG-HNG-180-SS",
    description: "بيانات اختبار مولّدة لعرض إدارة المخزون والمنتجات المتغيرة. مفصلة محورية بإنهاء ستانلس ساتان لأبواب الزجاج بدون إطار. لا تمثل مواصفات أو سعرًا تجاريًا معتمدًا.",
    referenceDescriptionEn: "Synthetic staging fixture for catalog and inventory QA; not approved merchant content.",
    priceAmount: 48900,
    compareAtAmount: 57900,
    stock: 17,
    isFeatured: true,
    imageUrl: "/manus-storage/mousa-staging-pivot-hinge-960_a720bd2c.webp",
    imageAlt: "صورة مولدة لمفصلة Pivot ستانلس ضمن كتالوج تجريبي",
    variants: [
      { label: "ستانلس ساتان / زجاج 8–10 مم", referenceLabelEn: "Satin stainless / 8–10 mm glass", sku: "STG-HNG-180-SS-8", priceAmount: 48900, compareAtAmount: 57900, stock: 11, sortOrder: 0 },
      { label: "أسود مطفي / زجاج 10–12 مم", referenceLabelEn: "Matte black / 10–12 mm glass", sku: "STG-HNG-180-BK-10", priceAmount: 52900, compareAtAmount: 61900, stock: 6, sortOrder: 1 },
    ],
  },
  {
    slug: "fixture-shower-door-seal",
    categorySlug: "fixture-bathroom-glass",
    name: "جلدة مانعة لتسرب باب الشاور — نموذج تجريبي",
    sku: "STG-SEAL-CLEAR-180",
    description: "بيانات اختبار مولّدة لعرض المنتجات منخفضة السعر والمخزون المتاح. جلدة شفافة افتراضية لأسفل باب زجاجي. لا تمثل خامة أو مقاسًا أو سعرًا معتمدًا للبيع.",
    referenceDescriptionEn: "Synthetic staging fixture for low-price inventory and search QA; not approved merchant content.",
    priceAmount: 18900,
    compareAtAmount: null,
    stock: 44,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-shower-seal-960_c44931f4.webp",
    imageAlt: "صورة مولدة لجلدة باب شاور شفافة ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-matte-black-glass-clamp",
    categorySlug: "fixture-glass-door-hardware",
    name: "مشبك زجاج أسود مطفي — نموذج تجريبي",
    sku: "STG-CLAMP-BLACK-SQ",
    description: "بيانات اختبار مولّدة لعرض المنتجات المخفضة والمتغيرات. مشبك زجاج افتراضي بوسادات حماية. لا يمثل تحملًا هندسيًا أو مواصفات تثبيت معتمدة.",
    referenceDescriptionEn: "Synthetic staging fixture for comparison-price and variant QA; not approved merchant content.",
    priceAmount: 31900,
    compareAtAmount: 36900,
    stock: 24,
    isFeatured: true,
    imageUrl: "/manus-storage/mousa-staging-glass-clamp-960_edf2c9ae.webp",
    imageAlt: "صورة مولدة لمشبك زجاج أسود مطفي ضمن كتالوج تجريبي",
    variants: [
      { label: "أسود مطفي / زجاج 8 مم", referenceLabelEn: "Matte black / 8 mm glass", sku: "STG-CLAMP-BK-8", priceAmount: 31900, compareAtAmount: 36900, stock: 14, sortOrder: 0 },
      { label: "أسود مطفي / زجاج 10 مم", referenceLabelEn: "Matte black / 10 mm glass", sku: "STG-CLAMP-BK-10", priceAmount: 33900, compareAtAmount: 39900, stock: 10, sortOrder: 1 },
    ],
  },
  {
    slug: "fixture-champagne-floor-guide",
    categorySlug: "fixture-glass-door-hardware",
    name: "دليل أرضي شامبين لباب منزلق — نموذج تجريبي",
    sku: "STG-GUIDE-CHAMPAGNE",
    description: "بيانات اختبار مولّدة لتجربة مستويات المخزون والتنبيهات. دليل أرضي افتراضي منخفض الارتفاع لأبواب زجاجية منزلقة. لا يمثل سعرًا أو قياسًا أو توافقًا معتمدًا.",
    referenceDescriptionEn: "Synthetic staging fixture for low-stock and operations QA; not approved merchant content.",
    priceAmount: 25900,
    compareAtAmount: 29900,
    stock: 16,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-floor-guide-960_d187b195.webp",
    imageAlt: "صورة مولدة لدليل أرضي شامبين ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-brass-mirror-clips",
    categorySlug: "fixture-bathroom-glass",
    name: "طقم مشابك مرايا نحاسية — نموذج تجريبي",
    sku: "STG-MIRROR-CLIP-BRASS",
    description: "بيانات اختبار مولّدة لعرض المنتجات متعددة الوحدات. طقم مشابك مرايا افتراضي بوسادات حماية. لا يمثل خامات أو سياسة ضمان أو سعرًا معتمدًا للبيع.",
    referenceDescriptionEn: "Synthetic staging fixture for compact catalog and operational QA; not approved merchant content.",
    priceAmount: 15900,
    compareAtAmount: 18900,
    stock: 42,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-mirror-clip-960_073fce64.webp",
    imageAlt: "صورة مولدة لطقم مشابك مرايا نحاسية ضمن كتالوج تجريبي",
    variants: [],
  },
];

fixtures.push(
  {
    slug: "fixture-patch-fitting-satin",
    categorySlug: "fixture-glass-door-hardware",
    name: "وصلة Patch ستانلس للزجاج — نموذج تجريبي",
    sku: "STG-PATCH-SATIN",
    description: "بيانات اختبار مولّدة لعرض الملحقات متوسطة السعر وإدارة SKU. لا تمثل مواصفات تركيب أو سعرًا معتمدًا للبيع.",
    referenceDescriptionEn: "Synthetic staging fixture for SKU and catalog QA; not approved merchant content.",
    priceAmount: 62500,
    compareAtAmount: null,
    stock: 9,
    isFeatured: true,
    imageUrl: "/manus-storage/mousa-staging-patch-fitting-960_d0b4966c.webp",
    imageAlt: "صورة مولدة لوصلة Patch ستانلس ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-sliding-roller-chrome",
    categorySlug: "fixture-glass-door-hardware",
    name: "بكرة باب زجاج منزلق كروم — نموذج تجريبي",
    sku: "STG-ROLLER-CHROME",
    description: "بيانات اختبار مولّدة لعرض تكوينات المنتج والمخزون المنخفض. لا تمثل توافقًا هندسيًا أو منتجًا معتمدًا.",
    referenceDescriptionEn: "Synthetic staging fixture for variant and low-stock QA; not approved merchant content.",
    priceAmount: 74500,
    compareAtAmount: 82500,
    stock: 4,
    isFeatured: true,
    imageUrl: "/manus-storage/mousa-staging-sliding-roller-960_be865525.webp",
    imageAlt: "صورة مولدة لبكرة باب زجاج منزلق ضمن كتالوج تجريبي",
    variants: [
      { label: "كروم / مسار علوي", referenceLabelEn: "Chrome / top track", sku: "STG-ROLLER-CHR-TOP", priceAmount: 74500, compareAtAmount: 82500, stock: 3, sortOrder: 0 },
      { label: "أسود / مسار علوي", referenceLabelEn: "Black / top track", sku: "STG-ROLLER-BLK-TOP", priceAmount: 77500, compareAtAmount: 85500, stock: 1, sortOrder: 1 },
    ],
  },
  {
    slug: "fixture-matte-black-u-channel",
    categorySlug: "fixture-bathroom-glass",
    name: "قناة U سوداء للزجاج — نموذج تجريبي",
    sku: "STG-U-CHANNEL-BLK",
    description: "بيانات اختبار مولّدة لعرض عنصر منخفض المخزون في فلاتر المتجر والإدارة. لا تمثل طولًا أو خامة معتمدة.",
    referenceDescriptionEn: "Synthetic staging fixture for low-stock filtering QA; not approved merchant content.",
    priceAmount: 22900,
    compareAtAmount: null,
    stock: 2,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-u-channel-960_0b6cfcad.webp",
    imageAlt: "صورة مولدة لقناة U سوداء ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-brass-pull-handle",
    categorySlug: "fixture-glass-door-hardware",
    name: "مقبض باب زجاج نحاسي مزدوج — نموذج تجريبي",
    sku: "STG-PULL-BRASS-450",
    description: "بيانات اختبار مولّدة لعرض مقارنة الأسعار وصور المنتجات الأصلية. لا تمثل مقاسًا أو تشطيبًا معتمدًا للبيع.",
    referenceDescriptionEn: "Synthetic staging fixture for compare-at price QA; not approved merchant content.",
    priceAmount: 89900,
    compareAtAmount: 104900,
    stock: 12,
    isFeatured: true,
    imageUrl: "/manus-storage/mousa-staging-pull-handle-960_b543fb3c.webp",
    imageAlt: "صورة مولدة لمقبض باب زجاج نحاسي ضمن كتالوج تجريبي",
    variants: [
      { label: "نحاسي / 450 مم", referenceLabelEn: "Brass / 450 mm", sku: "STG-PULL-BR-450", priceAmount: 89900, compareAtAmount: 104900, stock: 7, sortOrder: 0 },
      { label: "نحاسي / 600 مم", referenceLabelEn: "Brass / 600 mm", sku: "STG-PULL-BR-600", priceAmount: 99900, compareAtAmount: 114900, stock: 5, sortOrder: 1 },
    ],
  },
  {
    slug: "fixture-corner-connector-90",
    categorySlug: "fixture-bathroom-glass",
    name: "موصل زاوية زجاج 90° — نموذج تجريبي",
    sku: "STG-CORNER-90-SS",
    description: "بيانات اختبار مولّدة لعرض حالة نفاد المخزون دون تمكين أي طلب حقيقي. لا تمثل معيار سلامة أو تحملًا هندسيًا.",
    referenceDescriptionEn: "Synthetic staging fixture for out-of-stock QA; not approved merchant content.",
    priceAmount: 35900,
    compareAtAmount: null,
    stock: 0,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-corner-connector-960_3c10ce6c.webp",
    imageAlt: "صورة مولدة لموصل زاوية زجاج ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-clear-glass-spacer",
    categorySlug: "fixture-bathroom-glass",
    name: "فاصل زجاج شفاف صغير — نموذج تجريبي",
    sku: "STG-SPACER-CLEAR",
    description: "بيانات اختبار مولّدة لعرض المنتجات منخفضة السعر وقوائم المخزون. لا تمثل خامة أو استخدامًا معتمدًا.",
    referenceDescriptionEn: "Synthetic staging fixture for catalog-scale QA; not approved merchant content.",
    priceAmount: 9900,
    compareAtAmount: null,
    stock: 38,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-shower-seal-960_c44931f4.webp",
    imageAlt: "صورة مولدة لملحق زجاج شفاف ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-shower-stabilizer-bar",
    categorySlug: "fixture-bathroom-glass",
    name: "ذراع تثبيت شاور ستانلس — نموذج تجريبي",
    sku: "STG-STABILIZER-SS",
    description: "بيانات اختبار مولّدة لعرض فرز السعر والمخزون المتاح. لا تمثل طولًا أو قدرة تحمل معتمدة.",
    referenceDescriptionEn: "Synthetic staging fixture for sorting QA; not approved merchant content.",
    priceAmount: 53500,
    compareAtAmount: 59900,
    stock: 21,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-pivot-hinge-960_a720bd2c.webp",
    imageAlt: "صورة مولدة لملحق تثبيت زجاج ستانلس ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-wall-glass-hinge",
    categorySlug: "fixture-glass-door-hardware",
    name: "مفصلة حائط إلى زجاج — نموذج تجريبي",
    sku: "STG-WALL-HINGE",
    description: "بيانات اختبار مولّدة لعرض متابعة المخزون والمنتجات المميزة. لا تمثل مواصفات فنية أو عرضًا للبيع.",
    referenceDescriptionEn: "Synthetic staging fixture for featured catalog QA; not approved merchant content.",
    priceAmount: 55900,
    compareAtAmount: null,
    stock: 15,
    isFeatured: true,
    imageUrl: "/manus-storage/mousa-staging-pivot-hinge-960_a720bd2c.webp",
    imageAlt: "صورة مولدة لمفصلة زجاج ستانلس ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-glass-door-lock",
    categorySlug: "fixture-glass-door-hardware",
    name: "قفل باب زجاج صغير — نموذج تجريبي",
    sku: "STG-LOCK-SS",
    description: "بيانات اختبار مولّدة لعرض منتج غير مميز ذي مخزون متوسط. لا تمثل درجة أمان أو توافقًا معتمدًا.",
    referenceDescriptionEn: "Synthetic staging fixture for catalog management QA; not approved merchant content.",
    priceAmount: 41900,
    compareAtAmount: null,
    stock: 11,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-patch-fitting-960_d0b4966c.webp",
    imageAlt: "صورة مولدة لقفل باب زجاج ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-black-door-stop",
    categorySlug: "fixture-glass-door-hardware",
    name: "مصد باب زجاج أسود — نموذج تجريبي",
    sku: "STG-STOP-BLACK",
    description: "بيانات اختبار مولّدة لعرض مخزون مرتفع ومنتج صغير في إدارة المتجر. لا تمثل مواصفات أو سعرًا تجاريًا.",
    referenceDescriptionEn: "Synthetic staging fixture for high-stock QA; not approved merchant content.",
    priceAmount: 14900,
    compareAtAmount: null,
    stock: 64,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-glass-clamp-960_edf2c9ae.webp",
    imageAlt: "صورة مولدة لمصد باب زجاج أسود ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-mirror-frame-profile",
    categorySlug: "fixture-bathroom-glass",
    name: "بروفايل إطار مرآة شامبين — نموذج تجريبي",
    sku: "STG-MIRROR-FRAME-CH",
    description: "بيانات اختبار مولّدة لعرض مقارنة الأسعار في منتجات المرآة التجريبية. لا تمثل تشطيبًا أو قياسًا معتمدًا.",
    referenceDescriptionEn: "Synthetic staging fixture for mirror catalog QA; not approved merchant content.",
    priceAmount: 67900,
    compareAtAmount: 73900,
    stock: 7,
    isFeatured: true,
    imageUrl: "/manus-storage/mousa-staging-mirror-clip-960_073fce64.webp",
    imageAlt: "صورة مولدة لبروفايل إطار مرآة ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-glass-shelf-bracket",
    categorySlug: "fixture-bathroom-glass",
    name: "حامل رف زجاج كروم — نموذج تجريبي",
    sku: "STG-SHELF-BRACKET",
    description: "بيانات اختبار مولّدة لعرض المنتج القابل للتصفية والإدارة. لا تمثل حمولة أو استخدامًا معتمدًا.",
    referenceDescriptionEn: "Synthetic staging fixture for category filtering QA; not approved merchant content.",
    priceAmount: 28900,
    compareAtAmount: null,
    stock: 26,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-sliding-roller-960_be865525.webp",
    imageAlt: "صورة مولدة لحامل رف زجاج ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-privacy-film-sample",
    categorySlug: "fixture-bathroom-glass",
    name: "عينة فيلم خصوصية للزجاج — غير منشور تجريبي",
    sku: "STG-FILM-SAMPLE-HIDDEN",
    description: "بيانات اختبار مولّدة لعرض المنتج غير المنشور في لوحة الإدارة فقط. لا تمثل فيلمًا أو سياسة بيع معتمدة.",
    referenceDescriptionEn: "Synthetic inactive fixture for admin-only visibility QA; not approved merchant content.",
    priceAmount: 19900,
    compareAtAmount: null,
    stock: 8,
    isActive: false,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-u-channel-960_0b6cfcad.webp",
    imageAlt: "صورة مولدة لعينة فيلم زجاج غير منشورة ضمن كتالوج تجريبي",
    variants: [],
  },
  {
    slug: "fixture-replacement-gasket-hidden",
    categorySlug: "fixture-bathroom-glass",
    name: "جلدة استبدال داخلية — غير منشور تجريبي",
    sku: "STG-GASKET-HIDDEN",
    description: "بيانات اختبار مولّدة لعرض حالة المنتج غير النشط. لا تمثل قطعة غيار أو عرضًا للبيع.",
    referenceDescriptionEn: "Synthetic inactive fixture for admin QA; not approved merchant content.",
    priceAmount: 11900,
    compareAtAmount: null,
    stock: 0,
    isActive: false,
    isFeatured: false,
    imageUrl: "/manus-storage/mousa-staging-shower-seal-960_c44931f4.webp",
    imageAlt: "صورة مولدة لجلدة استبدال غير منشورة ضمن كتالوج تجريبي",
    variants: [],
  },
);

async function fixtureCategoryId(category) {
  await connection.execute(
    "INSERT INTO `categories` (`name`, `slug`, `description`, `isActive`, `sortOrder`) VALUES (?, ?, ?, 1, ?) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`), `isActive`=1, `sortOrder`=VALUES(`sortOrder`)",
    [category.name, category.slug, category.description, category.sortOrder],
  );
  const [rows] = await connection.execute("SELECT `id` FROM `categories` WHERE `slug`=? LIMIT 1", [category.slug]);
  return Number(rows[0].id);
}

async function fixtureProductId(fixture, categoryId) {
  const [existingRows] = await connection.execute("SELECT `id`, `isStagingFixture` FROM `products` WHERE `slug`=? LIMIT 1", [fixture.slug]);
  if (existingRows[0] && !Number(existingRows[0].isStagingFixture)) {
    throw new Error(`Refusing to overwrite non-fixture product ${fixture.slug}.`);
  }
  const isActive = fixture.isActive !== false;
  await connection.execute(
    "INSERT INTO `products` (`categoryId`, `name`, `slug`, `sku`, `description`, `referenceDescriptionEn`, `priceAmount`, `compareAtAmount`, `stock`, `isActive`, `isFeatured`, `isStagingFixture`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE `categoryId`=VALUES(`categoryId`), `name`=VALUES(`name`), `sku`=VALUES(`sku`), `description`=VALUES(`description`), `referenceDescriptionEn`=VALUES(`referenceDescriptionEn`), `priceAmount`=VALUES(`priceAmount`), `compareAtAmount`=VALUES(`compareAtAmount`), `stock`=VALUES(`stock`), `isActive`=VALUES(`isActive`), `isFeatured`=VALUES(`isFeatured`), `isStagingFixture`=1",
    [categoryId, fixture.name, fixture.slug, fixture.sku, fixture.description, fixture.referenceDescriptionEn, fixture.priceAmount, fixture.compareAtAmount, fixture.stock, isActive ? 1 : 0, fixture.isFeatured ? 1 : 0],
  );
  const [rows] = await connection.execute("SELECT `id` FROM `products` WHERE `slug`=? LIMIT 1", [fixture.slug]);
  return Number(rows[0].id);
}

async function replaceFixtureImages(productId, fixture) {
  await connection.execute("DELETE FROM `productImages` WHERE `productId`=?", [productId]);
  await connection.execute(
    "INSERT INTO `productImages` (`productId`, `storageKey`, `url`, `altText`, `sortOrder`) VALUES (?, ?, ?, ?, 0)",
    [productId, fixture.imageUrl.replace(/^\//, ""), fixture.imageUrl, fixture.imageAlt],
  );
}

async function replaceFixtureVariants(productId, fixture) {
  await connection.execute("DELETE FROM `productVariants` WHERE `productId`=? AND `isStagingFixture`=1", [productId]);
  for (const variant of fixture.variants) {
    await connection.execute(
      "INSERT INTO `productVariants` (`productId`, `label`, `referenceLabelEn`, `sku`, `priceAmount`, `compareAtAmount`, `stock`, `isActive`, `sortOrder`, `isStagingFixture`) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 1) ON DUPLICATE KEY UPDATE `label`=VALUES(`label`), `referenceLabelEn`=VALUES(`referenceLabelEn`), `priceAmount`=VALUES(`priceAmount`), `compareAtAmount`=VALUES(`compareAtAmount`), `stock`=VALUES(`stock`), `isActive`=1, `sortOrder`=VALUES(`sortOrder`), `isStagingFixture`=1",
      [productId, variant.label, variant.referenceLabelEn, variant.sku, variant.priceAmount, variant.compareAtAmount, variant.stock, variant.sortOrder],
    );
  }
}

async function upsertFixtureOrder(order, productId) {
  const fingerprint = createHash("sha256").update(order.orderNumber).digest("hex");
  await connection.execute(
    "INSERT INTO `orders` (`orderNumber`, `isStagingFixture`, `customerName`, `customerPhone`, `shippingAddress`, `notes`, `idempotencyKey`, `checkoutFingerprint`, `paymentMethod`, `paymentStatus`, `status`, `stockRestoredAt`, `subtotalAmount`, `shippingAmount`, `totalAmount`) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?) ON DUPLICATE KEY UPDATE `isStagingFixture`=1, `customerName`=VALUES(`customerName`), `customerPhone`=VALUES(`customerPhone`), `shippingAddress`=VALUES(`shippingAddress`), `notes`=VALUES(`notes`), `paymentMethod`=VALUES(`paymentMethod`), `paymentStatus`=VALUES(`paymentStatus`), `status`=VALUES(`status`), `stockRestoredAt`=VALUES(`stockRestoredAt`), `subtotalAmount`=VALUES(`subtotalAmount`), `shippingAmount`=0, `totalAmount`=VALUES(`totalAmount`)",
    [order.orderNumber, "عميل اختبار داخلي — لا يمثل عميلاً", "0000000000", "سجل اختبار داخلي — لا شحن أو تسليم", "سجل QA مولّد داخليًا؛ لا يمثل طلبًا أو دفعة أو عميلًا حقيقيًا.", `fixture-${order.orderNumber.toLowerCase()}`, fingerprint, order.paymentMethod, order.paymentStatus, order.status, order.status === "cancelled" ? new Date() : null, order.totalAmount, order.totalAmount],
  );
  const [rows] = await connection.execute("SELECT `id` FROM `orders` WHERE `orderNumber`=? AND `isStagingFixture`=1 LIMIT 1", [order.orderNumber]);
  const orderId = Number(rows[0].id);
  await connection.execute("DELETE FROM `orderItems` WHERE `orderId`=?", [orderId]);
  await connection.execute(
    "INSERT INTO `orderItems` (`orderId`, `productId`, `productName`, `imageUrl`, `unitPriceAmount`, `quantity`) VALUES (?, ?, ?, ?, ?, 1)",
    [orderId, productId, order.productName, order.imageUrl, order.totalAmount],
  );
}

try {
  const [settingsRows] = await connection.execute("SELECT `isCatalogStaging` FROM `storeSettings` WHERE `id`=1 LIMIT 1");
  if (!settingsRows[0] || !Number(settingsRows[0].isCatalogStaging)) {
    throw new Error("Refusing to seed fixtures because catalog staging is not enabled.");
  }

  await connection.execute("UPDATE `products` SET `isStagingFixture`=1 WHERE `slug` LIKE 'seed-%'");
  const categoryIds = new Map();
  for (const category of fixtureCategories) categoryIds.set(category.slug, await fixtureCategoryId(category));
  const productIds = new Map();
  for (const fixture of fixtures) {
    const productId = await fixtureProductId(fixture, categoryIds.get(fixture.categorySlug));
    await replaceFixtureImages(productId, fixture);
    await replaceFixtureVariants(productId, fixture);
    productIds.set(fixture.slug, productId);
  }

  const orders = [
    { orderNumber: "STG-QA-1001", fixtureSlug: "fixture-pivot-hinge-180", productName: "مفصلة Pivot ستانلس 180° — نموذج تجريبي", imageUrl: fixtures[0].imageUrl, totalAmount: 48900, paymentMethod: "cash_on_delivery", paymentStatus: "not_required", status: "pending" },
    { orderNumber: "STG-QA-1002", fixtureSlug: "fixture-matte-black-glass-clamp", productName: "مشبك زجاج أسود مطفي — نموذج تجريبي", imageUrl: fixtures[2].imageUrl, totalAmount: 31900, paymentMethod: "cash_on_delivery", paymentStatus: "not_required", status: "confirmed" },
    { orderNumber: "STG-QA-1003", fixtureSlug: "fixture-champagne-floor-guide", productName: "دليل أرضي شامبين لباب منزلق — نموذج تجريبي", imageUrl: fixtures[3].imageUrl, totalAmount: 25900, paymentMethod: "instapay", paymentStatus: "under_review", status: "shipped" },
    { orderNumber: "STG-QA-1004", fixtureSlug: "fixture-brass-mirror-clips", productName: "طقم مشابك مرايا نحاسية — نموذج تجريبي", imageUrl: fixtures[4].imageUrl, totalAmount: 15900, paymentMethod: "cash_on_delivery", paymentStatus: "not_required", status: "delivered" },
    { orderNumber: "STG-QA-1005", fixtureSlug: "fixture-shower-door-seal", productName: "جلدة مانعة لتسرب باب الشاور — نموذج تجريبي", imageUrl: fixtures[1].imageUrl, totalAmount: 18900, paymentMethod: "cash_on_delivery", paymentStatus: "not_required", status: "cancelled" },
  ];
  for (const order of orders) await upsertFixtureOrder(order, productIds.get(order.fixtureSlug));

  console.log(JSON.stringify({ seededProducts: fixtures.length, seededOrders: orders.length, message: "Staging-only fixtures seeded; customer ordering remains blocked by store settings." }));
} finally {
  connection.destroy();
}
