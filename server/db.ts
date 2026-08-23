import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  like,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  categories,
  type Category,
  type InsertUser,
  orderItems,
  orders,
  paymentProofs,
  productImages,
  products,
  storeSettings,
  users,
} from "../drizzle/schema";
import { createHash } from "node:crypto";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

type ImageRow = typeof productImages.$inferSelect;
type ProductRow = typeof products.$inferSelect;
export type CatalogProduct = ProductRow & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  images: ImageRow[];
};

async function enrichProducts(rows: ProductRow[]): Promise<CatalogProduct[]> {
  const db = await getDb();
  if (!db || rows.length === 0) return [];
  const productIds = rows.map(row => row.id);
  const categoryIds = Array.from(new Set(rows.map(row => row.categoryId).filter((id): id is number => id !== null)));
  const [imageRows, categoryRows] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, productIds)).orderBy(asc(productImages.sortOrder)),
    categoryIds.length
      ? db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).where(inArray(categories.id, categoryIds))
      : Promise.resolve([]),
  ]);
  const imagesByProduct = new Map<number, ImageRow[]>();
  for (const image of imageRows) {
    imagesByProduct.set(image.productId, [...(imagesByProduct.get(image.productId) ?? []), image]);
  }
  const categoryById = new Map(categoryRows.map(category => [category.id, category]));
  return rows.map(product => ({
    ...product,
    category: product.categoryId ? categoryById.get(product.categoryId) ?? null : null,
    images: imagesByProduct.get(product.id) ?? [],
  }));
}

export async function getStoreSettings() {
  const db = await getDb();
  if (!db) return { id: 1, storeName: "Mousa Glass", whatsappNumber: "201020848619", instaPayHandle: null, currency: "EGP", shippingFeeAmount: 0, isCatalogStaging: true, paymentProofRetentionDays: null };
  const rows = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);
  if (rows[0]) return rows[0];
  await db.insert(storeSettings).values({ id: 1, storeName: "Mousa Glass", whatsappNumber: "201020848619", currency: "EGP", shippingFeeAmount: 0, isCatalogStaging: true });
  return (await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1))[0]!;
}

export async function updateStoreSettings(input: {
  storeName?: string;
  whatsappNumber?: string;
  instaPayHandle?: string | null;
  shippingFeeAmount?: number;
  isCatalogStaging?: boolean;
  paymentProofRetentionDays?: number | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(storeSettings).values({ id: 1, storeName: "Mousa Glass", whatsappNumber: "201020848619", currency: "EGP", shippingFeeAmount: 0, isCatalogStaging: true }).onDuplicateKeyUpdate({ set: input });
  return getStoreSettings();
}

export async function getCategories(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(includeInactive ? undefined : eq(categories.isActive, true)).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function createCategory(input: { name: string; slug: string; description?: string | null; isActive: boolean; sortOrder: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(input);
  return Number((result as unknown as [{ insertId: number }])[0]?.insertId);
}

export async function updateCategory(id: number, input: Partial<{ name: string; slug: string; description: string | null; isActive: boolean; sortOrder: number }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(input).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
}

export type CatalogSort = "featured" | "newest" | "price_asc" | "price_desc" | "name_asc";

export async function getCatalogProducts(input: { search?: string; categorySlug?: string; featuredOnly?: boolean; sort?: CatalogSort; page: number; limit: number }) {
  const db = await getDb();
  if (!db) return { products: [], total: 0 };
  const filters: SQL[] = [eq(products.isActive, true)];
  if (input.featuredOnly) filters.push(eq(products.isFeatured, true));
  if (input.search?.trim()) {
    const term = `%${input.search.trim()}%`;
    filters.push(or(like(products.name, term), like(products.description, term))!);
  }
  if (input.categorySlug) {
    const category = await db.select({ id: categories.id }).from(categories).where(and(eq(categories.slug, input.categorySlug), eq(categories.isActive, true))).limit(1);
    if (!category[0]) return { products: [], total: 0 };
    filters.push(eq(products.categoryId, category[0].id));
  }
  const where = and(...filters);
  const orderBy = input.sort === "price_asc"
    ? [asc(products.priceAmount), desc(products.createdAt)]
    : input.sort === "price_desc"
      ? [desc(products.priceAmount), desc(products.createdAt)]
      : input.sort === "name_asc"
        ? [asc(products.name), desc(products.createdAt)]
        : input.sort === "newest"
          ? [desc(products.createdAt)]
          : [desc(products.isFeatured), desc(products.createdAt)];
  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products).where(where),
    db.select().from(products).where(where).orderBy(...orderBy).limit(input.limit).offset((input.page - 1) * input.limit),
  ]);
  return { products: await enrichProducts(rows), total: Number(countResult[0]?.count ?? 0) };
}

export async function getProductBySlug(slug: string, includeInactive = false) {
  const db = await getDb();
  if (!db) return null;
  const row = await db.select().from(products).where(includeInactive ? eq(products.slug, slug) : and(eq(products.slug, slug), eq(products.isActive, true))).limit(1);
  return (await enrichProducts(row))[0] ?? null;
}

export async function getProductById(id: number, includeInactive = false) {
  const db = await getDb();
  if (!db) return null;
  const row = await db.select().from(products).where(includeInactive ? eq(products.id, id) : and(eq(products.id, id), eq(products.isActive, true))).limit(1);
  return (await enrichProducts(row))[0] ?? null;
}

export async function getAdminProducts() {
  const db = await getDb();
  if (!db) return [];
  return enrichProducts(await db.select().from(products).orderBy(desc(products.updatedAt)));
}

export async function createProduct(input: {
  name: string;
  slug: string;
  description?: string | null;
  categoryId?: number | null;
  priceAmount: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(input);
  return Number((result as unknown as [{ insertId: number }])[0]?.insertId);
}

export async function updateProduct(id: number, input: Partial<{
  name: string;
  slug: string;
  description: string | null;
  categoryId: number | null;
  priceAmount: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(input).where(eq(products.id, id));
}

export function assertProductCanBeDeleted(orderReferenceCount: number) {
  if (orderReferenceCount > 0) {
    throw new Error("Products referenced by order history cannot be deleted. Archive the product by hiding it instead.");
  }
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.transaction(async tx => {
    const historicalReference = await tx.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.productId, id)).limit(1);
    assertProductCanBeDeleted(historicalReference.length);
    await tx.delete(productImages).where(eq(productImages.productId, id));
    await tx.delete(products).where(eq(products.id, id));
  });
}

export async function addProductImage(input: { productId: number; storageKey: string; url: string; altText?: string | null; sortOrder: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(productImages).values(input);
}

export async function deleteProductImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productImages).where(eq(productImages.id, id));
}

/** Removing this database reference makes the managed storage object inaccessible through the application. */
export async function deletePaymentProof(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(paymentProofs).where(eq(paymentProofs.id, id));
}

type CheckoutLine = { productId: number; quantity: number };
type CheckoutInput = {
  userId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  notes?: string | null;
  paymentMethod: "cash_on_delivery" | "instapay";
  items: CheckoutLine[];
  idempotencyKey: string;
};

function fingerprintCheckout(input: CheckoutInput) {
  return createHash("sha256")
    .update(JSON.stringify({
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail ?? null,
      shippingAddress: input.shippingAddress,
      notes: input.notes ?? null,
      paymentMethod: input.paymentMethod,
      items: [...input.items].sort((left, right) => left.productId - right.productId || left.quantity - right.quantity),
    }))
    .digest("hex");
}

function replayOrReject(existing: typeof orders.$inferSelect, fingerprint: string) {
  if (existing.checkoutFingerprint !== fingerprint) {
    throw new Error("This checkout request key was already used with different order details.");
  }
  return { orderId: existing.id, orderNumber: existing.orderNumber, totalAmount: existing.totalAmount, replayed: true as const };
}

export async function createCheckoutOrder(input: CheckoutInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const fingerprint = fingerprintCheckout(input);
  const existing = await db.select().from(orders).where(and(eq(orders.userId, input.userId), eq(orders.idempotencyKey, input.idempotencyKey))).limit(1);
  if (existing[0]) return replayOrReject(existing[0], fingerprint);

  try {
    return await db.transaction(async tx => {
    const settings = (await tx.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1))[0];
    const shippingAmount = settings?.shippingFeeAmount ?? 0;
    const stagedItems: Array<{ product: ProductRow; quantity: number; imageUrl: string | null }> = [];
    let subtotalAmount = 0;
    for (const line of input.items) {
      const product = (await tx.select().from(products).where(and(eq(products.id, line.productId), eq(products.isActive, true))).limit(1))[0];
      if (!product || product.stock < line.quantity) throw new Error("One or more products are unavailable in the requested quantity.");
      const primaryImage = (await tx.select({ url: productImages.url }).from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)).limit(1))[0];
      stagedItems.push({ product, quantity: line.quantity, imageUrl: primaryImage?.url ?? null });
      subtotalAmount += product.priceAmount * line.quantity;
    }

    const orderNumber = `MG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const orderInsert = await tx.insert(orders).values({
      orderNumber,
      userId: input.userId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail ?? null,
      shippingAddress: input.shippingAddress,
      notes: input.notes ?? null,
      idempotencyKey: input.idempotencyKey,
      checkoutFingerprint: fingerprint,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "instapay" ? "awaiting_proof" : "not_required",
      subtotalAmount,
      shippingAmount,
      totalAmount: subtotalAmount + shippingAmount,
    });
    const orderId = Number((orderInsert as unknown as [{ insertId: number }])[0]?.insertId);
    for (const item of stagedItems) {
      const stockUpdate = await tx.update(products).set({ stock: sql`${products.stock} - ${item.quantity}` }).where(and(eq(products.id, item.product.id), gte(products.stock, item.quantity)));
      const affected = Number((stockUpdate as unknown as [{ affectedRows: number }])[0]?.affectedRows ?? 0);
      if (affected !== 1) throw new Error("Stock changed while placing the order. Please try again.");
      await tx.insert(orderItems).values({
        orderId,
        productId: item.product.id,
        productName: item.product.name,
        imageUrl: item.imageUrl,
        unitPriceAmount: item.product.priceAmount,
        quantity: item.quantity,
      });
    }
      return { orderId, orderNumber, totalAmount: subtotalAmount + shippingAmount, replayed: false as const };
    });
  } catch (error) {
    const completedRequest = await db.select().from(orders).where(and(eq(orders.userId, input.userId), eq(orders.idempotencyKey, input.idempotencyKey))).limit(1);
    if (completedRequest[0]) return replayOrReject(completedRequest[0], fingerprint);
    throw error;
  }
}

async function hydrateOrders(orderRows: Array<typeof orders.$inferSelect>) {
  const db = await getDb();
  if (!db || orderRows.length === 0) return [];
  const ids = orderRows.map(order => order.id);
  const [itemRows, proofRows] = await Promise.all([
    db.select().from(orderItems).where(inArray(orderItems.orderId, ids)).orderBy(asc(orderItems.id)),
    db.select().from(paymentProofs).where(inArray(paymentProofs.orderId, ids)).orderBy(desc(paymentProofs.createdAt)),
  ]);
  return orderRows.map(order => ({
    ...order,
    items: itemRows.filter(item => item.orderId === order.id),
    paymentProofs: proofRows.filter(proof => proof.orderId === order.id),
  }));
}

export async function getOrdersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return hydrateOrders(await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)));
}

export async function getOrderForUser(orderId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).limit(1);
  return (await hydrateOrders(rows))[0] ?? null;
}

export type AdminOrderFilters = {
  status?: (typeof orders.status.enumValues)[number];
  paymentStatus?: (typeof orders.paymentStatus.enumValues)[number];
  query?: string;
  limit?: number;
};

export async function getAllOrders(filters: AdminOrderFilters = {}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const conditions: SQL[] = [];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  if (filters.paymentStatus) conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
  const query = filters.query?.trim();
  if (query) {
    const term = `%${query}%`;
    conditions.push(or(like(orders.orderNumber, term), like(orders.customerName, term), like(orders.customerPhone, term))!);
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, countRows] = await Promise.all([
    db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(Math.min(Math.max(filters.limit ?? 100, 1), 200)),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(where),
  ]);
  return { items: await hydrateOrders(rows), total: Number(countRows[0]?.count ?? 0) };
}

export async function getAllOrdersLegacy() {
  const result = await getAllOrders();
  return result.items;
}

export async function getAllOrdersForAdmin(filters: AdminOrderFilters = {}) {
  return getAllOrders(filters);
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return (await hydrateOrders(rows))[0] ?? null;
}

export async function addPaymentProof(input: { orderId: number; storageKey: string; url: string; originalFilename: string; mimeType: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.transaction(async tx => {
    const order = (await tx.select().from(orders).where(eq(orders.id, input.orderId)).limit(1))[0];
    if (!order) throw new Error("Order not found.");
    if (order.paymentMethod !== "instapay") throw new Error("Payment proof uploads are only available for InstaPay orders.");
    if (!canTransitionPaymentStatus(order.paymentStatus, "under_review")) {
      throw new Error("A new payment proof cannot be submitted for this order state.");
    }
    const update = await tx
      .update(orders)
      .set({ paymentStatus: "under_review" })
      .where(and(eq(orders.id, input.orderId), eq(orders.paymentStatus, order.paymentStatus)));
    const updated = Number((update as unknown as [{ affectedRows: number }])[0]?.affectedRows ?? 0);
    if (updated !== 1) throw new Error("Payment status changed while submitting the proof. Please try again.");
    await tx.insert(paymentProofs).values(input);
  });
}

export async function getPaymentProofAccessByStorageKey(storageKey: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({ orderUserId: orders.userId })
    .from(paymentProofs)
    .innerJoin(orders, eq(paymentProofs.orderId, orders.id))
    .where(eq(paymentProofs.storageKey, storageKey))
    .limit(1);
  return rows[0] ?? null;
}

export type OrderStatus = (typeof orders.status.enumValues)[number];
export type PaymentStatus = (typeof orders.paymentStatus.enumValues)[number];

const orderTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const paymentTransitions: Record<PaymentStatus, readonly PaymentStatus[]> = {
  not_required: [],
  awaiting_proof: ["under_review"],
  under_review: ["verified", "rejected"],
  verified: [],
  rejected: ["under_review"],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  return orderTransitions[from].includes(to);
}

export function canTransitionPaymentStatus(from: PaymentStatus, to: PaymentStatus) {
  return paymentTransitions[from].includes(to);
}

export function shouldRestoreStock(currentStatus: OrderStatus, requestedStatus: OrderStatus | undefined, stockRestoredAt: Date | null) {
  return currentStatus !== "cancelled" && requestedStatus === "cancelled" && stockRestoredAt === null && canTransitionOrderStatus(currentStatus, requestedStatus);
}

export async function updateOrder(input: { id: number; status?: OrderStatus; paymentStatus?: PaymentStatus }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.transaction(async tx => {
    const current = (await tx.select().from(orders).where(eq(orders.id, input.id)).limit(1))[0];
    if (!current) throw new Error("Order not found.");
    if (input.status && !canTransitionOrderStatus(current.status, input.status)) {
      throw new Error(`Order cannot move from ${current.status} to ${input.status}.`);
    }
    if (input.paymentStatus && !canTransitionPaymentStatus(current.paymentStatus, input.paymentStatus)) {
      throw new Error(`Payment cannot move from ${current.paymentStatus} to ${input.paymentStatus}.`);
    }

    const isCancelling = shouldRestoreStock(current.status, input.status, current.stockRestoredAt);
    const update = await tx
      .update(orders)
      .set({
        ...(input.status ? { status: input.status } : {}),
        ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
        ...(isCancelling ? { stockRestoredAt: new Date() } : {}),
      })
      .where(and(
        eq(orders.id, input.id),
        eq(orders.status, current.status),
        eq(orders.paymentStatus, current.paymentStatus),
        ...(isCancelling ? [isNull(orders.stockRestoredAt)] : []),
      ));
    const updated = Number((update as unknown as [{ affectedRows: number }])[0]?.affectedRows ?? 0);
    if (updated !== 1) throw new Error("Order changed while updating it. Please refresh and try again.");

    if (isCancelling) {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, input.id));
      for (const item of items) {
        await tx.update(products).set({ stock: sql`${products.stock} + ${item.quantity}` }).where(eq(products.id, item.productId));
      }
    }
  });
}

export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, revenueAmount: 0, pendingOrders: 0, productsCount: 0, activeProducts: 0, lowStockCount: 0, categoriesCount: 0, awaitingPayments: 0, topProducts: [], recentOrders: [], statusBreakdown: [] };
  const [orderCount, revenue, pending, productsCount, activeProducts, lowStockCount, categoriesCount, awaitingPayments, topProducts, recentOrders, statusBreakdown] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ total: sql<number>`coalesce(sum(${orders.totalAmount}), 0)` }).from(orders).where(ne(orders.status, "cancelled")),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(products).where(and(eq(products.isActive, true), sql`${products.stock} <= 5`)),
    db.select({ count: sql<number>`count(*)` }).from(categories),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(or(eq(orders.paymentStatus, "awaiting_proof"), eq(orders.paymentStatus, "under_review"))),
    db
      .select({ productName: orderItems.productName, quantity: sql<number>`sum(${orderItems.quantity})`, revenueAmount: sql<number>`sum(${orderItems.quantity} * ${orderItems.unitPriceAmount})` })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(ne(orders.status, "cancelled"))
      .groupBy(orderItems.productName)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
    db.select({ status: orders.status, count: sql<number>`count(*)` }).from(orders).groupBy(orders.status),
  ]);
  return {
    totalOrders: Number(orderCount[0]?.count ?? 0),
    revenueAmount: Number(revenue[0]?.total ?? 0),
    pendingOrders: Number(pending[0]?.count ?? 0),
    productsCount: Number(productsCount[0]?.count ?? 0),
    activeProducts: Number(activeProducts[0]?.count ?? 0),
    lowStockCount: Number(lowStockCount[0]?.count ?? 0),
    categoriesCount: Number(categoriesCount[0]?.count ?? 0),
    awaitingPayments: Number(awaitingPayments[0]?.count ?? 0),
    topProducts: topProducts.map(item => ({ ...item, quantity: Number(item.quantity), revenueAmount: Number(item.revenueAmount) })),
    recentOrders,
    statusBreakdown: statusBreakdown.map(item => ({ status: item.status, count: Number(item.count) })),
  };
}
