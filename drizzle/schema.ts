import {
  boolean,
  bigint,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/** Identity records are created and refreshed by the preconfigured Manus OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Categories are admin-managed and keep catalog navigation structured. */
export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description"),
    isActive: boolean("isActive").default(true).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("categories_slug_unique").on(table.slug)],
);

/** Prices are stored in the smallest currency unit (piastres) to avoid floating-point errors. */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("categoryId").references(() => categories.id, { onDelete: "set null" }),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    sku: varchar("sku", { length: 80 }),
    description: text("description"),
    referenceDescriptionEn: text("referenceDescriptionEn"),
    priceAmount: int("priceAmount").notNull(),
    compareAtAmount: int("compareAtAmount"),
    stock: int("stock").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    isStagingFixture: boolean("isStagingFixture").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("products_slug_unique").on(table.slug),
    uniqueIndex("products_sku_unique").on(table.sku),
    index("products_category_idx").on(table.categoryId),
    index("products_catalog_idx").on(table.isActive, table.isFeatured),
  ],
);

/** Variants provide a separate SKU, price, and stock bucket without changing the parent product identity. */
export const productVariants = mysqlTable(
  "productVariants",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 120 }).notNull(),
    referenceLabelEn: varchar("referenceLabelEn", { length: 120 }),
    sku: varchar("sku", { length: 100 }).notNull(),
    priceAmount: int("priceAmount").notNull(),
    compareAtAmount: int("compareAtAmount"),
    stock: int("stock").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    isStagingFixture: boolean("isStagingFixture").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("product_variants_sku_unique").on(table.sku),
    index("product_variants_product_idx").on(table.productId, table.isActive, table.sortOrder),
  ],
);

/** Image bytes live in object storage; this table holds only their durable metadata. */
export const productImages = mysqlTable(
  "productImages",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    storageKey: varchar("storageKey", { length: 500 }).notNull(),
    url: varchar("url", { length: 1000 }).notNull(),
    altText: varchar("altText", { length: 255 }),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("product_images_product_idx").on(table.productId, table.sortOrder)],
);

export const orderStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
export const paymentMethods = ["cash_on_delivery", "instapay"] as const;
export const paymentStatuses = ["not_required", "awaiting_proof", "under_review", "verified", "rejected"] as const;

/** One order is an immutable commercial record, with item details snapshotted separately. */
export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    orderNumber: varchar("orderNumber", { length: 32 }).notNull(),
    isStagingFixture: boolean("isStagingFixture").default(false).notNull(),
    userId: int("userId").references(() => users.id, { onDelete: "set null" }),
    customerName: varchar("customerName", { length: 160 }).notNull(),
    customerPhone: varchar("customerPhone", { length: 40 }).notNull(),
    customerEmail: varchar("customerEmail", { length: 320 }),
    shippingAddress: text("shippingAddress").notNull(),
    notes: text("notes"),
    idempotencyKey: varchar("idempotencyKey", { length: 64 }).notNull(),
    checkoutFingerprint: varchar("checkoutFingerprint", { length: 64 }).notNull(),
    paymentMethod: mysqlEnum("paymentMethod", paymentMethods).notNull(),
    paymentStatus: mysqlEnum("paymentStatus", paymentStatuses).default("not_required").notNull(),
    status: mysqlEnum("status", orderStatuses).default("pending").notNull(),
    stockRestoredAt: timestamp("stockRestoredAt"),
    subtotalAmount: int("subtotalAmount").notNull(),
    shippingAmount: int("shippingAmount").default(0).notNull(),
    totalAmount: int("totalAmount").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("orders_number_unique").on(table.orderNumber),
    uniqueIndex("orders_user_idempotency_unique").on(table.userId, table.idempotencyKey),
    index("orders_customer_idx").on(table.userId, table.createdAt),
    index("orders_status_idx").on(table.status, table.createdAt),
  ],
);

/** Item names and prices are copied at checkout, preserving an accurate order history. */
export const orderItems = mysqlTable(
  "orderItems",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: int("productId").notNull().references(() => products.id, { onDelete: "restrict" }),
    variantId: int("variantId").references(() => productVariants.id, { onDelete: "restrict" }),
    productName: varchar("productName", { length: 200 }).notNull(),
    variantLabel: varchar("variantLabel", { length: 120 }),
    imageUrl: varchar("imageUrl", { length: 1000 }),
    unitPriceAmount: int("unitPriceAmount").notNull(),
    quantity: int("quantity").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("order_items_order_idx").on(table.orderId), index("order_items_product_idx").on(table.productId)],
);

/** InstaPay evidence is intentionally isolated from orders for stricter access control and auditing. */
export const paymentProofs = mysqlTable(
  "paymentProofs",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
    storageKey: varchar("storageKey", { length: 500 }).notNull(),
    url: varchar("url", { length: 1000 }).notNull(),
    originalFilename: varchar("originalFilename", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 100 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("payment_proofs_order_idx").on(table.orderId)],
);

/** A single editable record keeps payment instructions and confirmation contact data out of source code. */
export const storeSettings = mysqlTable("storeSettings", {
  id: int("id").primaryKey(),
  storeName: varchar("storeName", { length: 120 }).default("Mousa Glass").notNull(),
  whatsappNumber: varchar("whatsappNumber", { length: 30 }).default("201020848619").notNull(),
  instaPayHandle: varchar("instaPayHandle", { length: 160 }),
  currency: varchar("currency", { length: 8 }).default("EGP").notNull(),
  shippingFeeAmount: int("shippingFeeAmount").default(0).notNull(),
  isCatalogStaging: boolean("isCatalogStaging").default(true).notNull(),
  paymentProofRetentionDays: int("paymentProofRetentionDays"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Cross-instance abuse-control buckets retain only a scoped HMAC digest, never
 * a raw IP address or customer input. Buckets expire through bounded cleanup in
 * the middleware's persistence helper.
 */
export const sharedRateLimitBuckets = mysqlTable(
  "sharedRateLimitBuckets",
  {
    id: int("id").autoincrement().primaryKey(),
    scope: varchar("scope", { length: 64 }).notNull(),
    keyHash: varchar("keyHash", { length: 64 }).notNull(),
    windowStartMs: bigint("windowStartMs", { mode: "number" }).notNull(),
    count: int("count").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("shared_rate_limit_scope_key_window_unique").on(table.scope, table.keyHash, table.windowStartMs),
    index("shared_rate_limit_window_idx").on(table.windowStartMs),
  ],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type PaymentProof = typeof paymentProofs.$inferSelect;
export type StoreSettings = typeof storeSettings.$inferSelect;
