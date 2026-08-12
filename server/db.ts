import { eq, desc, asc, like, and, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, categories, products, orders,
  orderItems, reviews, cartItems
} from "../drizzle/schema";
import { ENV } from './_core/env';

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
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== CATEGORIES ==========
export async function getCategories() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.id));
}

// ========== PRODUCTS ==========
export async function getProducts(params: { search?: string; categoryId?: number; minPrice?: number; maxPrice?: number; sortBy?: string; page?: number; limit?: number }) {
  const db = await getDb(); if (!db) return { products: [], total: 0 };
  const { search, categoryId, minPrice, maxPrice, sortBy = "newest", page = 1, limit = 12 } = params;
  const conditions: any[] = [eq(products.isActive, true)];
  if (search) { const s = `%${search}%`; conditions.push(or(like(products.nameAr, s), like(products.name, s), like(products.descriptionAr, s), like(products.description, s))!); }
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));
  if (minPrice) conditions.push(sql`${products.price} >= ${minPrice}`);
  if (maxPrice) conditions.push(sql`${products.price} <= ${maxPrice}`);
  let orderBy;
  switch (sortBy) { case "price_low": orderBy = asc(products.price); break; case "price_high": orderBy = desc(products.price); break; case "rating": orderBy = desc(products.rating); break; case "name": orderBy = asc(products.nameAr); break; default: orderBy = desc(products.createdAt); }
  const whereClause = and(...conditions);
  const offset = (page - 1) * limit;
  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(products).where(whereClause);
  const total = Number(countResult?.count ?? 0);
  const productList = await db.select().from(products).where(whereClause).orderBy(orderBy).limit(limit).offset(offset);
  return { products: productList, total };
}

export async function getProductById(id: number) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getFeaturedProducts() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(products).where(and(eq(products.isFeatured, true), eq(products.isActive, true))).orderBy(desc(products.rating)).limit(6);
}

export async function getAllProducts() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(products).orderBy(asc(products.id));
}

export async function createProduct(data: any) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot create product: database not available"); return { lastInsertId: 1 } as any; }
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: any) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot update product: database not available"); return; }
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot delete product: database not available"); return; }
  await db.delete(products).where(eq(products.id, id));
}

// ========== CART ==========
export async function getCart(userId: number) {
  const db = await getDb(); if (!db) return [];
  const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  const results = [];
  for (const item of items) {
    const prods = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
    results.push({ ...item, product: prods[0] ?? null });
  }
  return results;
}

export async function addToCart(userId: number, productId: number, quantity: number) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot add to cart: database not available"); return; }
  const existing = await db.select().from(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))).limit(1);
  if (existing.length > 0) { await db.update(cartItems).set({ quantity: existing[0].quantity + quantity, updatedAt: new Date() }).where(eq(cartItems.id, existing[0].id)); }
  else { await db.insert(cartItems).values({ userId, productId, quantity }); }
}

export async function updateCartItem(cartId: number, quantity: number, userId: number) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot update cart item: database not available"); return; }
  if (quantity <= 0) { await db.delete(cartItems).where(and(eq(cartItems.id, cartId), eq(cartItems.userId, userId))); }
  else { await db.update(cartItems).set({ quantity, updatedAt: new Date() }).where(and(eq(cartItems.id, cartId), eq(cartItems.userId, userId))); }
}

export async function removeFromCart(cartId: number, userId: number) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot remove from cart: database not available"); return; }
  await db.delete(cartItems).where(and(eq(cartItems.id, cartId), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot clear cart: database not available"); return; }
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ========== ORDERS ==========
export async function createOrder(data: any) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot create order: database not available"); return { lastInsertId: 1 } as any; }
  const result = await db.insert(orders).values(data);
  return result;
}

export async function createOrderItem(data: any) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot create order item: database not available"); return; }
  await db.insert(orderItems).values(data);
}

export async function getOrders(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb(); if (!db) return null;
  const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order[0]) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return { ...order[0], items };
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot update order status: database not available"); return; }
  await db.update(orders).set({ status: status as any, updatedAt: new Date() }).where(eq(orders.id, id));
}

// ========== REVIEWS ==========
export async function getReviews(productId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true))).orderBy(desc(reviews.createdAt));
}

export async function createReview(data: any) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot create review: database not available"); return; }
  await db.insert(reviews).values(data);
  const productReviews = await db.select().from(reviews).where(and(eq(reviews.productId, data.productId), eq(reviews.isApproved, true)));
  if (productReviews.length > 0) {
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    await db.update(products).set({ rating: avgRating, reviewCount: productReviews.length }).where(eq(products.id, data.productId));
  }
}

export async function getReviewsForAdmin(productId?: number) {
  const db = await getDb(); if (!db) return [];
  if (productId) { return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt)); }
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function approveReview(id: number, isApproved: boolean) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot approve review: database not available"); return; }
  await db.update(reviews).set({ isApproved, updatedAt: new Date() }).where(eq(reviews.id, id));
}

export async function deleteReview(id: number) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot delete review: database not available"); return; }
  await db.delete(reviews).where(eq(reviews.id, id));
}

// ========== ADMIN STATS ==========
export async function getDashboardStats() {
  const db = await getDb(); if (!db) return { products: 0, orders: 0, reviews: 0, revenue: 0 };
  const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
  const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const [reviewCount] = await db.select({ count: sql<number>`count(*)` }).from(reviews);
  const [revenueResult] = await db.select({ total: sql<number>`sum(total)` }).from(orders).where(sql`status != 'cancelled'`);
  return { products: Number(productCount?.count ?? 0), orders: Number(orderCount?.count ?? 0), reviews: Number(reviewCount?.count ?? 0), revenue: Number(revenueResult?.total ?? 0) };
}

// ========== SEED ==========
export async function seedCategories() {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const existing = await db.select().from(categories).limit(1);
  if (existing.length > 0) return;
  const cats = [
    { name: "Door Handles", nameAr: "مقابض الأبواب", description: "High-quality glass door handles", icon: "DoorOpen", image: "" },
    { name: "Shower Accessories", nameAr: "اكسسوارات الدوش", description: "Glass shower hardware", icon: "ShowerHead", image: "" },
    { name: "Glass Locks", nameAr: "كوالين الزجاج", description: "Multi-size glass locks", icon: "Lock", image: "" },
    { name: "Door Hinges", nameAr: "مفصلات الأبواب", description: "Floor and ceiling hinges", icon: "GripHorizontal", image: "" },
    { name: "Installation Parts", nameAr: "قطع التركيب", description: "Professional screws and bolts", icon: "Wrench", image: "" },
    { name: "Glass Panels", nameAr: "ألواح زجاجية", description: "Tempered and laminated glass", icon: "Square", image: "" },
  ];
  for (const cat of cats) await db.insert(categories).values(cat);
}

export async function seedProducts() {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const existing = await db.select().from(products).limit(1);
  if (existing.length > 0) return;
  const imgs = ["/images/glass-door-product_113bd9cd.jpg","/images/glass-shower_83a35009.jpg","/images/glass-products-hero_79a48c05.jpg","/images/category-banner_dbe4fbaa.jpg","/images/about-section_2b2aaa4a (1).jpg"];
  const pd = [
    { name: "Golden Glass Door Handle", nameAr: "مقبض باب زجاجي ذهبي", description: "Premium stainless steel handle", descriptionAr: "مقبض من الفولاذ المقاوم للصدأ بجودة عالية", price: 450, categoryId: 1, image: imgs[0], stock: 50, isFeatured: true, rating: 4.8, reviewCount: 24, sku: "HDL-001" },
    { name: "Chrome Strip Handle", nameAr: "مقبض شريطي كروم", description: "Sleek chrome bar handle", descriptionAr: "مقبض كروم أنيق بتصميم عصري", price: 380, categoryId: 1, image: imgs[0], stock: 35, rating: 4.5, reviewCount: 18, sku: "HDL-002" },
    { name: "Black Matte Handle", nameAr: "مقبض أسود مات", description: "Matte black handle", descriptionAr: "مقبض أسود مات بتصميم كلاسيكي", price: 520, categoryId: 1, image: imgs[0], stock: 20, rating: 4.9, reviewCount: 31, sku: "HDL-003" },
    { name: "Crystal Knob Handle", nameAr: "مقبض كريستال", description: "Crystal knob for glass doors", descriptionAr: "مقبض كريستال فاخر للأبواب الزجاجية", price: 680, categoryId: 1, image: imgs[0], stock: 15, rating: 4.7, reviewCount: 12, sku: "HDL-004" },
    { name: "Square Handle Set", nameAr: "طقم مقابض مربع", description: "Set of 2 square handles", descriptionAr: "طقم مقابض مربعة من قطعتين", price: 750, categoryId: 1, image: imgs[0], stock: 25, rating: 4.6, reviewCount: 9, sku: "HDL-005" },
    { name: "Frameless Shower Door", nameAr: "دوش زجاجي بدون إطار", description: "Premium frameless shower", descriptionAr: "باب دوش زجاجي بدون إطار بجودة عالمية", price: 1200, categoryId: 2, image: imgs[1], stock: 10, isFeatured: true, rating: 4.9, reviewCount: 42, sku: "SHW-001" },
    { name: "Shower Hardware Set", nameAr: "طقم اكسسوارات حمام كامل", description: "Complete shower hardware kit", descriptionAr: "طقم كامل لأكسسوارات الحمام", price: 2400, categoryId: 2, image: imgs[1], stock: 5, rating: 5.0, reviewCount: 15, sku: "SHW-002" },
    { name: "Shower Hinge", nameAr: "مفصلة دوش", description: "Stainless shower hinge", descriptionAr: "مفصلة ستانلس ستيل للدوش", price: 280, categoryId: 2, image: imgs[1], stock: 40, rating: 4.4, reviewCount: 7, sku: "SHW-003" },
    { name: "Shower Clamp", nameAr: "مشبك دوش", description: "Heavy duty shower clamp", descriptionAr: "مشبك دوش قوي ومتين", price: 180, categoryId: 2, image: imgs[1], stock: 60, rating: 4.3, reviewCount: 5, sku: "SHW-004" },
    { name: "Shower Seal Strip", nameAr: "شريط عزل الدوش", description: "Waterproof seal strip", descriptionAr: "شريط عزل مانع لتسرب المياه", price: 95, categoryId: 2, image: imgs[1], stock: 100, rating: 4.1, reviewCount: 3, sku: "SHW-005" },
    { name: "Tempered Glass Lock", nameAr: "كوالين زجاجية مقسى", description: "Heavy duty glass lock", descriptionAr: "قفل زجاجي قوي لمقاومة الحرارة", price: 320, categoryId: 3, image: imgs[2], stock: 45, rating: 4.6, reviewCount: 14, sku: "LCK-001" },
    { name: "Patch Lock with Key", nameAr: "قفل باتش مع مفتاح", description: "Patch fitting lock", descriptionAr: "قفل باتش مع مفتاح أمان", price: 450, categoryId: 3, image: imgs[2], stock: 30, rating: 4.8, reviewCount: 22, sku: "LCK-002" },
    { name: "Digital Glass Lock", nameAr: "قفل زجاجي رقمي", description: "Smart digital lock", descriptionAr: "قفل ذكي رقمي بتقنية البصمة", price: 1500, categoryId: 3, image: imgs[2], stock: 8, isFeatured: true, rating: 4.9, reviewCount: 35, sku: "LCK-003" },
    { name: "Floor Lock", nameAr: "قفل أرضي", description: "Concealed floor lock", descriptionAr: "قفل أرضي مخفي بتصميم أنيق", price: 550, categoryId: 3, image: imgs[2], stock: 20, rating: 4.5, reviewCount: 11, sku: "LCK-004" },
    { name: "Sliding Door Lock", nameAr: "قفل باب انزلاقي", description: "Sliding glass door lock", descriptionAr: "قفل للأبواب المنزلقة", price: 290, categoryId: 3, image: imgs[2], stock: 35, rating: 4.3, reviewCount: 8, sku: "LCK-005" },
    { name: "Floor Hinge 180kg", nameAr: "مفصلة أرضية 180 كجم", description: "Heavy duty floor hinge", descriptionAr: "مفصلة أرضية تتحمل حتى 180 كجم", price: 680, categoryId: 4, image: imgs[3], stock: 25, rating: 4.7, reviewCount: 19, sku: "HNG-001" },
    { name: "Ceiling Hinge", nameAr: "مفصلة سقفية", description: "Top pivot hinge", descriptionAr: "مفصلة سقفية لتوزيع الوزن", price: 420, categoryId: 4, image: imgs[3], stock: 30, rating: 4.4, reviewCount: 6, sku: "HNG-002" },
    { name: "Patch Hinge Set", nameAr: "طقم مفصلات باتش", description: "Set of 2 patch hinges", descriptionAr: "طقم مفصلات باتش من قطعتين", price: 580, categoryId: 4, image: imgs[3], stock: 18, rating: 4.6, reviewCount: 13, sku: "HNG-003" },
    { name: "180° Swing Hinge", nameAr: "مفصلة دوران 180 درجة", description: "Full swing glass hinge", descriptionAr: "مفصلة دوران كامل 180 درجة", price: 750, categoryId: 4, image: imgs[3], stock: 12, rating: 4.8, reviewCount: 17, sku: "HNG-004" },
    { name: "Self-Closing Hinge", nameAr: "مفصلة ذاتية الإغلاق", description: "Auto-close glass hinge", descriptionAr: "مفصلة تغلق تلقائياً", price: 890, categoryId: 4, image: imgs[3], stock: 10, rating: 4.5, reviewCount: 8, sku: "HNG-005" },
    { name: "Stainless Steel Bolts Set", nameAr: "طقم مسامير ستانلس", description: "Professional bolt set", descriptionAr: "طقم مسامير ستانلس ستيل احترافي", price: 150, categoryId: 5, image: imgs[4], stock: 80, rating: 4.2, reviewCount: 4, sku: "INS-001" },
    { name: "Wall Anchor Kit", nameAr: "طقم دعامات حائط", description: "Complete wall anchor kit", descriptionAr: "طقم دعامات حائط كامل", price: 220, categoryId: 5, image: imgs[4], stock: 50, rating: 4.3, reviewCount: 6, sku: "INS-002" },
    { name: "Glass Suction Cup", nameAr: "كوب شفط زجاج", description: "Professional suction cup", descriptionAr: "كوب شفط احترافي لرفع الزجاج", price: 350, categoryId: 5, image: imgs[4], stock: 15, rating: 4.6, reviewCount: 9, sku: "INS-003" },
    { name: "Leveling Feet", nameAr: "أرجل تسوية", description: "Adjustable leveling feet", descriptionAr: "أرجل تسوية قابلة للتعديل", price: 120, categoryId: 5, image: imgs[4], stock: 70, rating: 4.1, reviewCount: 3, sku: "INS-004" },
    { name: "Installation Tool Kit", nameAr: "طقم أدوات تركيب", description: "Complete installation tools", descriptionAr: "طقم أدوات تركيب كامل", price: 800, categoryId: 5, image: imgs[4], stock: 8, rating: 4.7, reviewCount: 11, sku: "INS-005" },
    { name: "Tempered Glass 10mm", nameAr: "زجاج مقسى 10 مم", description: "Clear tempered glass panel", descriptionAr: "لوح زجاج مقسى شفاف 10 مم", price: 1800, categoryId: 6, image: imgs[2], stock: 20, isFeatured: true, rating: 4.9, reviewCount: 28, sku: "GLS-001" },
    { name: "Laminated Glass 8mm", nameAr: "زجاج مصفح 8 مم", description: "Safety laminated glass", descriptionAr: "زجاج أمان مصفح 8 مم", price: 2200, categoryId: 6, image: imgs[2], stock: 15, rating: 4.8, reviewCount: 16, sku: "GLS-002" },
    { name: "Frosted Glass Panel", nameAr: "لوح زجاج مات", description: "Decorative frosted glass", descriptionAr: "لوح زجاج ديكوري مات", price: 1500, categoryId: 6, image: imgs[2], stock: 25, rating: 4.5, reviewCount: 7, sku: "GLS-003" },
    { name: "Mirror Glass Panel", nameAr: "لوح مرايا", description: "High quality mirror glass", descriptionAr: "لوح مرايا عالي الجودة", price: 900, categoryId: 6, image: imgs[2], stock: 30, rating: 4.4, reviewCount: 5, sku: "GLS-004" },
    { name: "Smart Glass Panel", nameAr: "زجاج ذكي", description: "Switchable smart glass", descriptionAr: "زجاج ذكي قابل للتحويل", price: 5500, categoryId: 6, image: imgs[2], stock: 3, rating: 5.0, reviewCount: 20, sku: "GLS-005" },
  ];
  for (const p of pd) await db.insert(products).values(p);
}
