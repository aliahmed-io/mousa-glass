import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import { products, categories } from "./drizzle/schema.ts";

dotenv.config({ path: ".env.local" });

const db = drizzle(process.env.DATABASE_URL);

// First seed categories
const existingCats = await db.select().from(categories).limit(1);
if (existingCats.length === 0) {
  const cats = [
    { name: "Door Handles", nameAr: "مقابض الأبواب", description: "مقابض أبواب زجاجية عالية الجودة", icon: "DoorOpen", image: "" },
    { name: "Shower Accessories", nameAr: "اكسسوارات الدوش", description: "اكسسوارات حمام زجاجية", icon: "ShowerHead", image: "" },
    { name: "Glass Locks", nameAr: "كوالين الزجاج", description: "كوالين زجاجية بمقاسات مختلفة", icon: "Lock", image: "" },
    { name: "Door Hinges", nameAr: "مفصلات الأبواب", description: "مفصلات أرضية وسقفية", icon: "GripHorizontal", image: "" },
    { name: "Installation Parts", nameAr: "قطع التركيب", description: "مسامير ودعامات احترافية", icon: "Wrench", image: "" },
    { name: "Glass Panels", nameAr: "ألواح زجاجية", description: "زجاج مقسّى ومصّفح", icon: "Square", image: "" },
  ];
  for (const cat of cats) {
    await db.insert(categories).values(cat);
  }
  console.log("Seeded categories");
}

// Check existing products - skip if already seeded
const existingProducts = await db.select().from(products).limit(1);
if (existingProducts.length > 0) {
  console.log("Products already exist (" + existingProducts.length + "), skipping seed.");
  process.exit(0);
}

const imgs = {
  handle: "/images/glass-door-product_113bd9cd.jpg",
  shower: "/images/glass-shower_83a35009.jpg",
  hero: "/images/glass-products-hero_79a48c05.jpg",
  banner: "/images/category-banner_dbe4fbaa.jpg",
  about: "/images/about-section_2b2aaa4a (1).jpg",
};

const productData = [
  // مقابض الأبواب (category 1)
  { name: "Classic Gold Handle", nameAr: "مقبض ذهبي كلاسيكي", description: "مقبض باب زجاجي فاخر بتصميم كلاسيكي", descriptionAr: "مقبض باب زجاجي فاخر بتصميم كلاسيكي ذهبي", price: 350, categoryId: 1, image: imgs.handle, rating: 4.5, ratingCount: 23, isFeatured: true, stock: 50, sku: "HDL-001" },
  { name: "Modern Black Handle", nameAr: "مقبض أسود مودرن", description: "مقبض زجاجي عصري بتصميم أسود مات", descriptionAr: "مقبض زجاجي عصري بتصميم أسود مات", price: 280, categoryId: 1, image: imgs.handle, rating: 4.3, ratingCount: 18, isFeatured: true, stock: 40, sku: "HDL-002" },
  { name: "Stainless Steel Handle", nameAr: "مقبض ستانلس ستيل", description: "مقبض زجاجي من الستانلس ستيل المقاوم للصدأ", descriptionAr: "مقبض زجاجي من الستانلس ستيل المقاوم للصدأ", price: 420, categoryId: 1, image: imgs.handle, rating: 4.7, ratingCount: 31, isFeatured: false, stock: 35, sku: "HDL-003" },
  { name: "Bronze Handle Pro", nameAr: "مقبض برونز احترافي", description: "مقبض برونزي احترافي للأبواب الزجاجية", descriptionAr: "مقبض برونزي احترافي للأبواب الزجاجية", price: 550, categoryId: 1, image: imgs.handle, rating: 4.8, ratingCount: 15, isFeatured: false, stock: 25, sku: "HDL-004" },
  { name: "Slim Gold Handle", nameAr: "مقبض ذهبي نحيف", description: "مقبض ذهبي نحيف وأنيق", descriptionAr: "مقبض ذهبي نحيف وأنيق", price: 290, categoryId: 1, image: imgs.handle, rating: 4.2, ratingCount: 12, isFeatured: false, stock: 60, sku: "HDL-005" },

  // اكسسوارات الدوش (category 2)
  { name: "Shower Door Handle", nameAr: "مقبض باب دوش", description: "مقبض مخصص لأبواب الدوش الزجاجية", descriptionAr: "مقبض مخصص لأبواب الدوش الزجاجية", price: 250, categoryId: 2, image: imgs.shower, rating: 4.5, ratingCount: 22, isFeatured: true, stock: 55, sku: "SHW-001" },
  { name: "Shower Hinge Set", nameAr: "طقم مفصلات دوش", description: "طقم مفصلات لأبواب الدوش", descriptionAr: "طقم مفصلات لأبواب الدوش", price: 380, categoryId: 2, image: imgs.shower, rating: 4.3, ratingCount: 16, isFeatured: false, stock: 40, sku: "SHW-002" },
  { name: "Shower Glass Clamp", nameAr: "كلمبة زجاج دوش", description: "كلمبة تثبيت زجاج الدوش", descriptionAr: "كلمبة تثبيت زجاج الدوش", price: 180, categoryId: 2, image: imgs.shower, rating: 4.1, ratingCount: 14, isFeatured: false, stock: 70, sku: "SHW-003" },
  { name: "Shower Seal Strip", nameAr: "شريط عزل دوش", description: "شريط عزل مائي لأبواب الدوش", descriptionAr: "شريط عزل مائي لأبواب الدوش", price: 120, categoryId: 2, image: imgs.shower, rating: 4.0, ratingCount: 9, isFeatured: false, stock: 100, sku: "SHW-004" },
  { name: "Pivot Door System", nameAr: "نظام باب دوراني", description: "نظام باب دوراني كامل للدوش", descriptionAr: "نظام باب دوراني كامل للدوش", price: 650, categoryId: 2, image: imgs.shower, rating: 4.7, ratingCount: 11, isFeatured: true, stock: 20, sku: "SHW-005" },

  // كوالين الزجاج (category 3)
  { name: "Glass Door Lock", nameAr: "كوالين باب زجاجي", description: "كوالين آمن للأبواب الزجاجية", descriptionAr: "كوالين آمن للأبواب الزجاجية", price: 450, categoryId: 3, image: imgs.hero, rating: 4.6, ratingCount: 25, isFeatured: true, stock: 30, sku: "LCK-001" },
  { name: "Sliding Door Lock", nameAr: "كوالين باب منزلق", description: "كوالين للأبواب المنزلقة الزجاجية", descriptionAr: "كوالين للأبواب المنزلقة الزجاجية", price: 380, categoryId: 3, image: imgs.hero, rating: 4.4, ratingCount: 17, isFeatured: false, stock: 35, sku: "LCK-002" },
  { name: "Digital Glass Lock", nameAr: "كوالين زجاجي رقمي", description: "كوالين زجاجي بتقنية رقمية", descriptionAr: "كوالين زجاجي بتقنية رقمية", price: 850, categoryId: 3, image: imgs.hero, rating: 4.8, ratingCount: 8, isFeatured: true, stock: 15, sku: "LCK-003" },
  { name: "Heavy Duty Lock", nameAr: "كوالين ثقيل", description: "كوالين ثقيل للأبواب الزجاجية الكبيرة", descriptionAr: "كوالين ثقيل للأبواب الزجاجية الكبيرة", price: 520, categoryId: 3, image: imgs.hero, rating: 4.5, ratingCount: 20, isFeatured: false, stock: 25, sku: "LCK-004" },
  { name: "Patch Lock", nameAr: "قفل باتش", description: "قفل باتش للأبواب الزجاجية", descriptionAr: "قفل باتش للأبواب الزجاجية", price: 400, categoryId: 3, image: imgs.hero, rating: 4.3, ratingCount: 14, isFeatured: false, stock: 30, sku: "LCK-005" },

  // مفصلات الأبواب (category 4)
  { name: "Floor Spring Hinge", nameAr: "مفصل أرضي سبرنج", description: "مفصل أرضي سبرنج للأبواب الزجاجية", descriptionAr: "مفصل أرضي سبرنج للأبواب الزجاجية", price: 350, categoryId: 4, image: imgs.banner, rating: 4.3, ratingCount: 18, isFeatured: false, stock: 40, sku: "HNG-001" },
  { name: "Pivot Hinge", nameAr: "مفصل دوراني", description: "مفصل دوراني للأبواب الزجاجية", descriptionAr: "مفصل دوراني للأبواب الزجاجية", price: 280, categoryId: 4, image: imgs.banner, rating: 4.2, ratingCount: 13, isFeatured: false, stock: 50, sku: "HNG-002" },
  { name: "Ceiling Hinge", nameAr: "مفصل سقف", description: "مفصل سقف للأبواب الزجاجية", descriptionAr: "مفصل سقف للأبواب الزجاجية", price: 320, categoryId: 4, image: imgs.banner, rating: 4.4, ratingCount: 15, isFeatured: false, stock: 45, sku: "HNG-003" },
  { name: "Heavy Duty Hinge", nameAr: "مفصل ثقيل", description: "مفصل ثقيل للأبواب الزجاجية الكبيرة", descriptionAr: "مفصل ثقيل للأبواب الزجاجية الكبيرة", price: 450, categoryId: 4, image: imgs.banner, rating: 4.6, ratingCount: 21, isFeatured: true, stock: 30, sku: "HNG-004" },
  { name: "Self-Closing Hinge", nameAr: "مفصل ذاتي الإغلاق", description: "مفصل يغلق تلقائياً", descriptionAr: "مفصل يغلق تلقائياً", price: 580, categoryId: 4, image: imgs.banner, rating: 4.5, ratingCount: 10, isFeatured: false, stock: 20, sku: "HNG-005" },

  // قطع التركيب (category 5)
  { name: "Wall Clamp Set", nameAr: "طقم كلمبات حائط", description: "طقم كلمبات تثبيت للحائط", descriptionAr: "طقم كلمبات تثبيت للحائط", price: 200, categoryId: 5, image: imgs.about, rating: 4.1, ratingCount: 11, isFeatured: false, stock: 80, sku: "INS-001" },
  { name: "Glass Bracket", nameAr: "براكيت زجاجي", description: "براكيت تثبيت للزجاج", descriptionAr: "براكيت تثبيت للزجاج", price: 150, categoryId: 5, image: imgs.about, rating: 4.0, ratingCount: 9, isFeatured: false, stock: 90, sku: "INS-002" },
  { name: "Floor Patch Fitting", nameAr: "قطع أرضية", description: "قطع تثبيت أرضية للأبواب الزجاجية", descriptionAr: "قطع تثبيت أرضية للأبواب الزجاجية", price: 380, categoryId: 5, image: imgs.about, rating: 4.5, ratingCount: 16, isFeatured: false, stock: 35, sku: "INS-003" },
  { name: "Corner Connector", nameAr: "موصل زاوية", description: "موصل زاوية للزجاج", descriptionAr: "موصل زاوية للزجاج", price: 180, categoryId: 5, image: imgs.about, rating: 4.2, ratingCount: 12, isFeatured: false, stock: 60, sku: "INS-004" },
  { name: "Suction Cup Set", nameAr: "طقم كؤوس شفط", description: "كؤوس شفط احترافية لرفع الزجاج", descriptionAr: "كؤوس شفط احترافية لرفع الزجاج", price: 450, categoryId: 5, image: imgs.about, rating: 4.6, ratingCount: 8, isFeatured: true, stock: 15, sku: "INS-005" },

  // ألواح زجاجية (category 6)
  { name: "Tempered Glass 8mm", nameAr: "زجاج مقسّى 8 مم", description: "زجاج مقسّى بسماكة 8 مم", descriptionAr: "زجاج مقسّى بسماكة 8 مم", price: 1200, categoryId: 6, image: imgs.hero, rating: 4.7, ratingCount: 28, isFeatured: true, stock: 20, sku: "GLS-001" },
  { name: "Laminated Glass", nameAr: "زجاج مصفح", description: "زجاج مصفح آمن", descriptionAr: "زجاج مصفح آمن", price: 1500, categoryId: 6, image: imgs.hero, rating: 4.6, ratingCount: 14, isFeatured: false, stock: 15, sku: "GLS-002" },
  { name: "Frosted Glass Panel", nameAr: "لوح زجاجي معتم", description: "لوح زجاجي معتم للتصميم الداخلي", descriptionAr: "لوح زجاجي معتم للتصميم الداخلي", price: 950, categoryId: 6, image: imgs.hero, rating: 4.4, ratingCount: 10, isFeatured: false, stock: 25, sku: "GLS-003" },
  { name: "Mirrored Glass", nameAr: "زجاج مرآة", description: "زجاج مرآة عالي الجودة", descriptionAr: "زجاج مرآة عالي الجودة", price: 800, categoryId: 6, image: imgs.hero, rating: 4.3, ratingCount: 17, isFeatured: false, stock: 30, sku: "GLS-004" },
  { name: "Tinted Glass", nameAr: "زجاج ملوّن", description: "زجاج ملوّن للخصوصية", descriptionAr: "زجاج ملوّن للخصوصية", price: 1100, categoryId: 6, image: imgs.hero, rating: 4.5, ratingCount: 13, isFeatured: false, stock: 20, sku: "GLS-005" },
];

for (const p of productData) {
  await db.insert(products).values({
    name: p.name,
    nameAr: p.nameAr,
    description: p.description,
    descriptionAr: p.descriptionAr,
    price: p.price,
    categoryId: p.categoryId,
    image: p.image,
    rating: p.rating,
    reviewCount: p.ratingCount,
    isFeatured: p.isFeatured,
    stock: p.stock,
    sku: p.sku,
  });
}

console.log(`Seeded ${productData.length} products`);
