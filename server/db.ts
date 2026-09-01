import { eq, desc, asc, like, and, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, User, users, categories, products, orders,
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

// ========== USERS ==========
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod", "phone", "address", "city", "notes"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    };
    textFields.forEach(assignNullable);
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (
      (user.openId && user.openId === ENV.ownerOpenId) ||
      (user.email && adminEmails.includes(user.email.toLowerCase()))
    ) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
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

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(id: number, data: { phone?: string | null; address?: string | null; city?: string | null; notes?: string | null; name?: string | null }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
}

// ========== CATEGORIES ==========
export async function getCategories() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.id));
}

export async function getCategoriesWithCount() {
  const db = await getDb(); if (!db) return [];
  const cats = await db.select().from(categories).orderBy(asc(categories.id));
  const result = [];
  for (const cat of cats) {
    const [prodCount] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.categoryId, cat.id));
    result.push({ ...cat, productCount: Number(prodCount?.count ?? 0) });
  }
  return result;
}

export async function createCategory(data: { name: string; nameAr: string; description?: string; icon?: string; image?: string }) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot create category: database not available"); return { lastInsertId: 1 } as any; }
  const result = await db.insert(categories).values(data);
  return result;
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot update category: database not available"); return; }
  await db.update(categories).set({ ...data, updatedAt: new Date() }).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot delete category: database not available"); return; }
  await db.delete(categories).where(eq(categories.id, id));
}

// ========== PRODUCTS ==========
export async function getProducts(params: { search?: string; categoryId?: number; minPrice?: number; maxPrice?: number; sortBy?: string; page?: number; limit?: number }) {
  const db = await getDb();
  const { search, categoryId, minPrice, maxPrice, sortBy = "newest", page = 1, limit = 12 } = params;

  if (!db) {
    let filtered = DEFAULT_50_PRODUCTS.filter(p => p.isActive);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.nameAr.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.descriptionAr && p.descriptionAr.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    if (categoryId) filtered = filtered.filter(p => p.categoryId === categoryId);
    if (minPrice) filtered = filtered.filter(p => p.price >= minPrice);
    if (maxPrice) filtered = filtered.filter(p => p.price <= maxPrice);

    switch (sortBy) {
      case "price_low": filtered.sort((a, b) => a.price - b.price); break;
      case "price_high": filtered.sort((a, b) => b.price - a.price); break;
      case "rating": filtered.sort((a, b) => b.rating - a.rating); break;
      case "name": filtered.sort((a, b) => a.nameAr.localeCompare(b.nameAr)); break;
      default: filtered.sort((a, b) => b.id - a.id);
    }

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);
    return { products: paginated, total };
  }

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
  const db = await getDb();
  if (!db) {
    return DEFAULT_50_PRODUCTS.find(p => p.id === id) ?? null;
  }
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) {
    return DEFAULT_50_PRODUCTS.filter(p => p.isFeatured && p.isActive).slice(0, 6);
  }
  return db.select().from(products).where(and(eq(products.isFeatured, true), eq(products.isActive, true))).orderBy(desc(products.rating)).limit(6);
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) {
    return [...DEFAULT_50_PRODUCTS];
  }
  return db.select().from(products).orderBy(asc(products.id));
}

export async function createProduct(data: any) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot create product: database not available"); return { lastInsertId: 1 } as any; }
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: any) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot update product: database not available"); return; }
  await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id));
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
  const orderList = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  const enriched = [];
  for (const order of orderList) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    enriched.push({ ...order, items });
  }
  return enriched;
}

export async function getAllOrders() {
  const db = await getDb(); if (!db) return [];
  const orderList = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const enriched = [];
  for (const order of orderList) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    enriched.push({ ...order, items });
  }
  return enriched;
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

// ========== REVIEWS & RECALCULATION ==========
export async function recalculateProductRating(productId: number) {
  const db = await getDb(); if (!db) return;
  const approvedReviews = await db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)));
  if (approvedReviews.length > 0) {
    const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
    await db.update(products).set({
      rating: Number(avgRating.toFixed(1)),
      reviewCount: approvedReviews.length,
      updatedAt: new Date()
    }).where(eq(products.id, productId));
  } else {
    await db.update(products).set({
      rating: 0,
      reviewCount: 0,
      updatedAt: new Date()
    }).where(eq(products.id, productId));
  }
}

export async function getReviews(productId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true))).orderBy(desc(reviews.createdAt));
}

export async function createReview(data: any) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot create review: database not available"); return; }
  await db.insert(reviews).values(data);
  await recalculateProductRating(data.productId);
}

export async function getReviewsForAdmin(productId?: number) {
  const db = await getDb(); if (!db) return [];
  const query = productId
    ? db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt))
    : db.select().from(reviews).orderBy(desc(reviews.createdAt));
  const reviewList = await query;
  const enriched = [];
  for (const r of reviewList) {
    const prod = await db.select({
      id: products.id,
      nameAr: products.nameAr,
      name: products.name,
      image: products.image,
      sku: products.sku
    }).from(products).where(eq(products.id, r.productId)).limit(1);
    
    const usr = r.userId && r.userId > 0
      ? await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, r.userId)).limit(1)
      : [];
      
    enriched.push({
      ...r,
      product: prod[0] ?? null,
      user: usr[0] ?? null,
    });
  }
  return enriched;
}

export async function approveReview(id: number, isApproved: boolean) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot approve review: database not available"); return; }
  const review = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  await db.update(reviews).set({ isApproved, updatedAt: new Date() }).where(eq(reviews.id, id));
  if (review[0]) {
    await recalculateProductRating(review[0].productId);
  }
}

export async function deleteReview(id: number) {
  const db = await getDb(); if (!db) { console.warn("[Database] Cannot delete review: database not available"); return; }
  const review = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  await db.delete(reviews).where(eq(reviews.id, id));
  if (review[0]) {
    await recalculateProductRating(review[0].productId);
  }
}

// ========== ADMIN STATS ==========
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) {
    const lowStock = DEFAULT_50_PRODUCTS.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = DEFAULT_50_PRODUCTS.filter(p => p.stock === 0).length;
    return {
      products: DEFAULT_50_PRODUCTS.length,
      orders: 0,
      pendingOrders: 0,
      lowStock,
      outOfStock,
      reviews: 0,
      unapprovedReviews: 0,
      revenue: 0,
    };
  }
  const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
  const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const [pendingOrderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending"));
  const [lowStockCount] = await db.select({ count: sql<number>`count(*)` }).from(products).where(and(sql`${products.stock} > 0`, sql`${products.stock} <= 5`));
  const [outOfStockCount] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.stock, 0));
  const [reviewCount] = await db.select({ count: sql<number>`count(*)` }).from(reviews);
  const [unapprovedReviewCount] = await db.select({ count: sql<number>`count(*)` }).from(reviews).where(eq(reviews.isApproved, false));
  const [revenueResult] = await db.select({ total: sql<number>`sum(total)` }).from(orders).where(sql`status != 'cancelled'`);

  return {
    products: Number(productCount?.count ?? 0),
    orders: Number(orderCount?.count ?? 0),
    pendingOrders: Number(pendingOrderCount?.count ?? 0),
    lowStock: Number(lowStockCount?.count ?? 0),
    outOfStock: Number(outOfStockCount?.count ?? 0),
    reviews: Number(reviewCount?.count ?? 0),
    unapprovedReviews: Number(unapprovedReviewCount?.count ?? 0),
    revenue: Number(revenueResult?.total ?? 0),
  };
}

// ========== 50 COMPLETE REALISTIC PRODUCTS DATASET ==========
export const DEFAULT_50_PRODUCTS = [
  // 1. Category 1: Door Handles (9 products)
  { id: 1, name: "Golden Glass Door Handle", nameAr: "مقبض باب زجاجي ذهبي فاخر", description: "Premium stainless steel handle with PVD gold finish", descriptionAr: "مقبض من الفولاذ المقاوم للصدأ بجودة عالية وتصميم مصقول ذهبي فاخر", price: 450, salePrice: null, categoryId: 1, image: "/images/glass-door-product_113bd9cd.jpg", stock: 50, isFeatured: true, rating: 4.8, reviewCount: 24, sku: "HDL-001", isActive: true },
  { id: 2, name: "Chrome Strip Handle", nameAr: "مقبض شريطي كروم عصري", description: "Sleek chrome bar handle", descriptionAr: "مقبض كروم أنيق بتصميم عصري ملائم للمكاتب والفلل", price: 380, salePrice: 420, categoryId: 1, image: "/images/glass-door-product_113bd9cd.jpg", stock: 12, isFeatured: false, rating: 4.5, reviewCount: 18, sku: "HDL-002", isActive: true },
  { id: 3, name: "Black Matte Handle", nameAr: "مقبض أسود مات ملكي", description: "Matte black luxury handle", descriptionAr: "مقبض أسود مات بتصميم كلاسيكي وملمس ناعم مقاوم للبصمات", price: 520, salePrice: null, categoryId: 1, image: "/images/glass-door-product_113bd9cd.jpg", stock: 4, isFeatured: false, rating: 4.9, reviewCount: 31, sku: "HDL-003", isActive: true },
  { id: 4, name: "Crystal Knob Handle", nameAr: "مقبض كريستال ماسي فاخر", description: "Crystal knob for glass doors", descriptionAr: "مقبض كريستال فاخر للأبواب الزجاجية والديكورات الراقية", price: 680, salePrice: null, categoryId: 1, image: "/images/glass-door-product_113bd9cd.jpg", stock: 15, isFeatured: false, rating: 4.7, reviewCount: 12, sku: "HDL-004", isActive: true },
  { id: 5, name: "Square Handle Set", nameAr: "طقم مقابض مربعة مزدوجة", description: "Set of 2 square handles", descriptionAr: "طقم مقابض مربعة من قطعتين للأبواب المزدوجة من ستانلس 304", price: 750, salePrice: null, categoryId: 1, image: "/images/glass-door-product_113bd9cd.jpg", stock: 25, isFeatured: false, rating: 4.6, reviewCount: 9, sku: "HDL-005", isActive: true },
  { id: 6, name: "Rose Gold Luxury Pull", nameAr: "مقبض سحب روز جولد", description: "Rose gold tubular pull handle", descriptionAr: "مقبض أنبوبي بلون الروز جولد العصري المقاوم للتآكل", price: 590, salePrice: null, categoryId: 1, image: "/images/glass-door-product_113bd9cd.jpg", stock: 18, isFeatured: false, rating: 4.7, reviewCount: 14, sku: "HDL-006", isActive: true },
  { id: 7, name: "T-Bar Commercial Handle 100cm", nameAr: "مقبض تجاري تي-بار 100 سم", description: "Heavy duty 1 meter T-bar handle", descriptionAr: "مقبض تجاري طويل 100 سم للمحلات والمولات والشركات", price: 850, salePrice: 950, categoryId: 1, image: "/images/glass-door-product_113bd9cd.jpg", stock: 8, isFeatured: false, rating: 4.8, reviewCount: 20, sku: "HDL-007", isActive: true },
  { id: 8, name: "Brushed Brass Architectural Pull", nameAr: "مقبض نحاسي مطفي معماري", description: "Architectural brass pull handle", descriptionAr: "مقبض نحاسي مصقول مطفي للمشاريع الهندسية والمعارض", price: 620, salePrice: null, categoryId: 1, image: "/images/glass-door-product_113bd9cd.jpg", stock: 22, isFeatured: false, rating: 4.6, reviewCount: 11, sku: "HDL-008", isActive: true },
  { id: 9, name: "Recessed Flush Pull Handle", nameAr: "مقبض غاطس للأبواب الجرارة", description: "Flush pull for sliding glass", descriptionAr: "مقبض دائري غاطس لا يعيق حركة الباب الجرار", price: 290, salePrice: null, categoryId: 1, image: "/images/glass-door-product_113bd9cd.jpg", stock: 35, isFeatured: false, rating: 4.4, reviewCount: 8, sku: "HDL-009", isActive: true },

  // 2. Category 2: Shower Accessories (9 products)
  { id: 10, name: "Frameless Shower Door Kit", nameAr: "طقم دوش زجاجي بدون إطار", description: "Premium frameless shower kit", descriptionAr: "طقم كامل لكبائن الاستحمام الزجاجية بدون إطار", price: 1200, salePrice: null, categoryId: 2, image: "/images/glass-shower_83a35009.jpg", stock: 4, isFeatured: true, rating: 4.9, reviewCount: 42, sku: "SHW-001", isActive: true },
  { id: 11, name: "Shower Hardware Set 304", nameAr: "طقم اكسسوارات حمام كامل 304", description: "Complete shower hardware kit", descriptionAr: "طقم كامل لأكسسوارات الحمام من الستانلس ستيل 304 المقاوم للمياه والصدأ", price: 2400, salePrice: null, categoryId: 2, image: "/images/glass-shower_83a35009.jpg", stock: 5, isFeatured: false, rating: 5.0, reviewCount: 15, sku: "SHW-002", isActive: true },
  { id: 12, name: "Shower Hinge Heavy Duty", nameAr: "مفصلة دوش شديدة التحمل 90°", description: "Stainless shower hinge", descriptionAr: "مفصلة ستانلس ستيل لكبائن الدوش عالية المتانة زاوية 90 درجة", price: 280, salePrice: null, categoryId: 2, image: "/images/glass-shower_83a35009.jpg", stock: 40, isFeatured: false, rating: 4.4, reviewCount: 7, sku: "SHW-003", isActive: true },
  { id: 13, name: "Shower Clamp 90 Degree", nameAr: "مشبك زجاجي دوش 90 درجة", description: "Heavy duty shower clamp", descriptionAr: "مشبك زجاجي زاوية 90 درجة لتثبيت كابينة الاستحمام بالحائط", price: 180, salePrice: null, categoryId: 2, image: "/images/glass-shower_83a35009.jpg", stock: 60, isFeatured: false, rating: 4.3, reviewCount: 5, sku: "SHW-004", isActive: true },
  { id: 14, name: "Shower Magnetic Seal Strip 2M", nameAr: "شريط عزل دوش مغناطيسي 2 متر", description: "Waterproof seal strip", descriptionAr: "شريط سيليكون مغناطيسي مانع لتسرب المياه مع شفة مرنة", price: 95, salePrice: null, categoryId: 2, image: "/images/glass-shower_83a35009.jpg", stock: 100, isFeatured: false, rating: 4.1, reviewCount: 3, sku: "SHW-005", isActive: true },
  { id: 15, name: "Sliding Shower Roller Set", nameAr: "طقم عجل كابينة دوش جرار", description: "Stainless sliding rollers", descriptionAr: "طقم بكرات وعجل انسيابي للأبواب الجرارة لكبائن الشاور", price: 480, salePrice: null, categoryId: 2, image: "/images/glass-shower_83a35009.jpg", stock: 20, isFeatured: false, rating: 4.6, reviewCount: 16, sku: "SHW-006", isActive: true },
  { id: 16, name: "Glass Stabilizer Support Bar", nameAr: "ذراع تثبيت ودعامة زجاج دوش", description: "Telescopic support bar", descriptionAr: "ذراع ستانلس تلسكوبي لتدعيم وثبات ألواح الشاور الزجاجية", price: 340, salePrice: null, categoryId: 2, image: "/images/glass-shower_83a35009.jpg", stock: 25, isFeatured: false, rating: 4.5, reviewCount: 9, sku: "SHW-007", isActive: true },
  { id: 17, name: "Diamond Knob Shower Handle", nameAr: "مقبض دوش مزدوج بشكل ألماسي", description: "Dual side shower knob", descriptionAr: "مقبض دوش دائري مضلع بوجهين يمنح قبضة محكمة ومظهراً فخماً", price: 210, salePrice: null, categoryId: 2, image: "/images/glass-shower_83a35009.jpg", stock: 35, isFeatured: false, rating: 4.4, reviewCount: 6, sku: "SHW-008", isActive: true },
  { id: 18, name: "U-Channel Wall Aluminum Profile", nameAr: "مجرى ألومنيوم حائطي يو-تشانل", description: "U-channel profile for fixed glass", descriptionAr: "بروفايل ألومنيوم غاطس لتثبيت الألواح الزجاجية الثابتة بالحائط", price: 160, salePrice: null, categoryId: 2, image: "/images/glass-shower_83a35009.jpg", stock: 50, isFeatured: false, rating: 4.2, reviewCount: 4, sku: "SHW-009", isActive: true },

  // 3. Category 3: Glass Locks (8 products)
  { id: 19, name: "Tempered Glass Lock", nameAr: "كالون زجاج مقسى مركزي", description: "Heavy duty glass lock", descriptionAr: "قفل زجاجي قوي من الفولاذ المقاوم للصدأ للأبواب المفردة والمزدوجة", price: 320, salePrice: null, categoryId: 3, image: "/images/glass-products-hero_79a48c05.jpg", stock: 45, isFeatured: false, rating: 4.6, reviewCount: 14, sku: "LCK-001", isActive: true },
  { id: 20, name: "Patch Lock with Computer Key", nameAr: "كالون باتش مع مفتاح كمبيوتر", description: "Patch fitting lock", descriptionAr: "كالون باتش مع مفاتيح كمبيوتر عالية الأمان ومقاومة للنسخ", price: 450, salePrice: null, categoryId: 3, image: "/images/glass-products-hero_79a48c05.jpg", stock: 2, isFeatured: false, rating: 4.8, reviewCount: 22, sku: "LCK-002", isActive: true },
  { id: 21, name: "Digital Smart Glass Lock", nameAr: "كالون زجاجي ذكي ببصمة الإصبع", description: "Smart digital lock", descriptionAr: "قفل رقمي ذكي بالبصمة والرمز السري والبطاقة وبلوتوث للمكاتب والفلل", price: 1500, salePrice: null, categoryId: 3, image: "/images/glass-products-hero_79a48c05.jpg", stock: 8, isFeatured: true, rating: 4.9, reviewCount: 35, sku: "LCK-003", isActive: true },
  { id: 22, name: "Concealed Floor Lock", nameAr: "كالون أرضي مخفي للأمان", description: "Concealed floor lock", descriptionAr: "قفل أرضي مخفي أنيق للأبواب الزجاجية السيكوريت يثبت بالبلاط", price: 550, salePrice: null, categoryId: 3, image: "/images/glass-products-hero_79a48c05.jpg", stock: 20, isFeatured: false, rating: 4.5, reviewCount: 11, sku: "LCK-004", isActive: true },
  { id: 23, name: "Sliding Glass Door Lock", nameAr: "كالون خطافي لباب جرار زجاج", description: "Sliding glass door hook lock", descriptionAr: "كالون خطافي مخصص للأبواب الزجاجية الجرارة والسحابة", price: 290, salePrice: null, categoryId: 3, image: "/images/glass-products-hero_79a48c05.jpg", stock: 35, isFeatured: false, rating: 4.3, reviewCount: 8, sku: "LCK-005", isActive: true },
  { id: 24, name: "Double Glass Door Center Lock", nameAr: "كالون وسطي لبابين زجاجيين", description: "Center lock for double doors", descriptionAr: "كالون أوسط يجمع بين ضلفتين زجاج بدون الحاجة لتثبيت أرضي", price: 420, salePrice: null, categoryId: 3, image: "/images/glass-products-hero_79a48c05.jpg", stock: 16, isFeatured: false, rating: 4.5, reviewCount: 10, sku: "LCK-006", isActive: true },
  { id: 25, name: "Magnetic Glass Latch Touch-Open", nameAr: "مزلاج مغناطيسي زجاجي بلمسة واحدة", description: "Magnetic touch latch", descriptionAr: "مزلاج مغناطيسي يفتح بالضغط بلمسة خفيفة لدواليب الزجاج والمعارض", price: 110, salePrice: null, categoryId: 3, image: "/images/glass-products-hero_79a48c05.jpg", stock: 65, isFeatured: false, rating: 4.2, reviewCount: 5, sku: "LCK-007", isActive: true },
  { id: 26, name: "Over-Glass Security Lock Kit", nameAr: "قفل أمان علوي للزجاج السيكوريت", description: "Top clamp security lock", descriptionAr: "قفل علوي يثبت بدون تخريم في الزجاج لتوفير أقصى درجات الأمان", price: 380, salePrice: null, categoryId: 3, image: "/images/glass-products-hero_79a48c05.jpg", stock: 19, isFeatured: false, rating: 4.4, reviewCount: 7, sku: "LCK-008", isActive: true },

  // 4. Category 4: Door Hinges & Floor Springs (8 products)
  { id: 27, name: "Floor Hinge 180kg Dorma Type", nameAr: "ماكينة أرضية 180 كجم نوع دورما", description: "Heavy duty floor hinge", descriptionAr: "مفصلة وماكينة أرضية هيدروليكية تتحمل حتى 180 كجم وعمر افتراضي طويل", price: 680, salePrice: null, categoryId: 4, image: "/images/category-banner_dbe4fbaa.jpg", stock: 25, isFeatured: false, rating: 4.7, reviewCount: 19, sku: "HNG-001", isActive: true },
  { id: 28, name: "Top Pivot Ceiling Hinge", nameAr: "مفصلة سقفية علوية للتوجيه", description: "Top pivot hinge", descriptionAr: "مفصلة سقفية علوية لتثبيت وتوجيه الأبواب الزجاجية المحورية", price: 420, salePrice: null, categoryId: 4, image: "/images/category-banner_dbe4fbaa.jpg", stock: 30, isFeatured: false, rating: 4.4, reviewCount: 6, sku: "HNG-002", isActive: true },
  { id: 29, name: "Patch Fitting Complete Set", nameAr: "طقم كبسولات باتش كامل (علوي + سفلي)", description: "Set of patch hinges", descriptionAr: "طقم كبسولات باتش علوي وسفلي من الستانلس ستيل المصقول مع اللقمات", price: 580, salePrice: null, categoryId: 4, image: "/images/category-banner_dbe4fbaa.jpg", stock: 18, isFeatured: false, rating: 4.6, reviewCount: 13, sku: "HNG-003", isActive: true },
  { id: 30, name: "180° Swing Glass Hinge", nameAr: "مفصلة دوران كامل 180 درجة", description: "Full swing glass hinge", descriptionAr: "مفصلة دوران كامل 180 درجة للأبواب الزجاجية والأكشاك", price: 750, salePrice: null, categoryId: 4, image: "/images/category-banner_dbe4fbaa.jpg", stock: 12, isFeatured: false, rating: 4.8, reviewCount: 17, sku: "HNG-004", isActive: true },
  { id: 31, name: "Auto Self-Closing Hydraulic Hinge", nameAr: "مفصلة هيدروليكية ذاتية الإغلاق", description: "Auto-close glass hinge", descriptionAr: "مفصلة هيدروليكية تغلق الباب بنعومة وسلاسة بدون ماكينة أرضية", price: 890, salePrice: null, categoryId: 4, image: "/images/category-banner_dbe4fbaa.jpg", stock: 10, isFeatured: false, rating: 4.5, reviewCount: 8, sku: "HNG-005", isActive: true },
  { id: 32, name: "Heavy Duty Floor Spring 250kg", nameAr: "ماكينة أرضية عملاقة 250 كجم للمشاريع", description: "Commercial 250kg floor spring", descriptionAr: "ماكينة أرضية فائقة التحمل مخصصة للأبواب الزجاجية الثقيلة والواجهات", price: 1100, salePrice: null, categoryId: 4, image: "/images/category-banner_dbe4fbaa.jpg", stock: 7, isFeatured: false, rating: 4.9, reviewCount: 15, sku: "HNG-006", isActive: true },
  { id: 33, name: "Glass-to-Glass 180° Connector Hinge", nameAr: "مفصلة زجاج بزجاج 180 درجة", description: "Glass to glass connector hinge", descriptionAr: "مفصلة تثبيت مباشرة من لوح زجاج إلى لوح زجاج متحرك", price: 390, salePrice: null, categoryId: 4, image: "/images/category-banner_dbe4fbaa.jpg", stock: 28, isFeatured: false, rating: 4.4, reviewCount: 9, sku: "HNG-007", isActive: true },
  { id: 34, name: "Soft-Close Hydraulic Overhead Closer", nameAr: "دفاش هيدروليكي علوي سوفت-كلوز", description: "Overhead soft close door closer", descriptionAr: "دفاش علوي ناعم لمنع ارتطام الأبواب الزجاجية وتنظيم سرعة القفل", price: 650, salePrice: null, categoryId: 4, image: "/images/category-banner_dbe4fbaa.jpg", stock: 14, isFeatured: false, rating: 4.6, reviewCount: 12, sku: "HNG-008", isActive: true },

  // 5. Category 5: Installation Hardware & Spider Fittings (8 products)
  { id: 35, name: "Stainless Steel Fixation Bolts 304", nameAr: "طقم مسامير وتثبيت ستانلس 304", description: "Professional bolt set", descriptionAr: "طقم مسامير وبراغي تثبيت مقاومة للصدأ والتآكل للمحترفين", price: 150, salePrice: null, categoryId: 5, image: "/images/about-section_2b2aaa4a (1).jpg", stock: 80, isFeatured: false, rating: 4.2, reviewCount: 4, sku: "INS-001", isActive: true },
  { id: 36, name: "Heavy Wall Anchor Kit", nameAr: "طقم دعامات تثبيت حائطي ثقيل", description: "Complete wall anchor kit", descriptionAr: "طقم دعامات حائطية متينة لتثبيت الألواح والكبائن الزجاجية بأمان", price: 220, salePrice: null, categoryId: 5, image: "/images/about-section_2b2aaa4a (1).jpg", stock: 50, isFeatured: false, rating: 4.3, reviewCount: 6, sku: "INS-002", isActive: true },
  { id: 37, name: "Dual Glass Suction Cup", nameAr: "شفاط زجاج مزدوج احترافي للرفع", description: "Professional suction cup", descriptionAr: "كوب شفط احترافي ثنائي لرفع ونقل الزجاج والألواح الثقيلة بأمان", price: 350, salePrice: null, categoryId: 5, image: "/images/about-section_2b2aaa4a (1).jpg", stock: 15, isFeatured: false, rating: 4.6, reviewCount: 9, sku: "INS-003", isActive: true },
  { id: 38, name: "Adjustable Leveling Feet Set", nameAr: "طقم أرجل تسوية قابلة للضبط", description: "Adjustable leveling feet", descriptionAr: "أرجل تسوية من الستانلس ستيل لضبط استواء الكبائن على الأرضيات المائلة", price: 120, salePrice: null, categoryId: 5, image: "/images/about-section_2b2aaa4a (1).jpg", stock: 70, isFeatured: false, rating: 4.1, reviewCount: 3, sku: "INS-004", isActive: true },
  { id: 39, name: "Professional Installation Tool Kit", nameAr: "حقيبة عدة تركيب زجاج متكاملة", description: "Complete installation tools", descriptionAr: "طقم متكامل من أدوات الفنيين لتركيب الأبواب والواجهات والزجاج", price: 800, salePrice: null, categoryId: 5, image: "/images/about-section_2b2aaa4a (1).jpg", stock: 8, isFeatured: false, rating: 4.7, reviewCount: 11, sku: "INS-005", isActive: true },
  { id: 40, name: "Spider Fitting 4-Way 220mm", nameAr: "إسبايدر زجاج 4 أذرع 220 مم للواجهات", description: "4-way stainless spider fitting", descriptionAr: "قطعة إسبايدر ستانلس 316 رباعية لتثبيت واجهات الزجاج الإنشائي المعماري", price: 950, salePrice: null, categoryId: 5, image: "/images/about-section_2b2aaa4a (1).jpg", stock: 30, isFeatured: false, rating: 4.9, reviewCount: 18, sku: "INS-006", isActive: true },
  { id: 41, name: "Spider Fitting 2-Way 90°", nameAr: "إسبايدر زجاج ذراعين زاوية 90°", description: "2-way 90 degree spider fitting", descriptionAr: "قطعة إسبايدر ثنائية لزوايا الواجهات الزجاجية الخارجية", price: 620, salePrice: null, categoryId: 5, image: "/images/about-section_2b2aaa4a (1).jpg", stock: 24, isFeatured: false, rating: 4.7, reviewCount: 8, sku: "INS-007", isActive: true },
  { id: 42, name: "Point-Fixed Glass Standoff Pin 50mm", nameAr: "مسمار إسبايدر ستاند أوف 50 مم", description: "Stainless steel glass standoff pin", descriptionAr: "مسمار تثبيت نقطي مصمت لتثبيت الدرابزين والدرج الزجاجي بالحوائط الخرسانية", price: 175, salePrice: null, categoryId: 5, image: "/images/about-section_2b2aaa4a (1).jpg", stock: 120, isFeatured: false, rating: 4.5, reviewCount: 15, sku: "INS-008", isActive: true },

  // 6. Category 6: Glass Panels & Mirrors (8 products)
  { id: 43, name: "Tempered Glass Panel 10mm Clear", nameAr: "لوح زجاج سيكوريت 10 مم شفاف فائق النقاء", description: "Clear tempered glass panel", descriptionAr: "لوح زجاج سيكوريت معالج حرارياً عالي المتانة 10 مم معالجة ضد الخدش", price: 1800, salePrice: null, categoryId: 6, image: "/images/glass-products-hero_91b8e903.jpg", stock: 20, isFeatured: true, rating: 4.9, reviewCount: 28, sku: "GLS-001", isActive: true },
  { id: 44, name: "Safety Laminated Glass 8mm", nameAr: "لوح زجاج مصفح 8 مم أمان مضاعف", description: "Safety laminated glass", descriptionAr: "زجاج أمان مصفح متعدد الطبقات عازل للصوت ومقاوم للصدمات والكسر", price: 2200, salePrice: null, categoryId: 6, image: "/images/glass-products-hero_91b8e903.jpg", stock: 15, isFeatured: false, rating: 4.8, reviewCount: 16, sku: "GLS-002", isActive: true },
  { id: 45, name: "Frosted Matte Securit Panel", nameAr: "لوح زجاج سيكوريت مسنفر مات للخصوصية", description: "Decorative frosted glass", descriptionAr: "لوح زجاج سيكوريت مسنفر كيميائياً للخصوصية التامة في المكاتب والحمامات", price: 1500, salePrice: null, categoryId: 6, image: "/images/glass-products-hero_91b8e903.jpg", stock: 25, isFeatured: false, rating: 4.5, reviewCount: 7, sku: "GLS-003", isActive: true },
  { id: 46, name: "High Clarity Belgian Mirror Panel", nameAr: "لوح مرايا بلجيكي فائق النقاء كريستال", description: "High quality mirror glass", descriptionAr: "لوح مرايا بلجيكي نقي عاكس للضوء مع طبقة حماية خلفية ضد الرطوبة", price: 900, salePrice: null, categoryId: 6, image: "/images/glass-products-hero_91b8e903.jpg", stock: 30, isFeatured: false, rating: 4.4, reviewCount: 5, sku: "GLS-004", isActive: true },
  { id: 47, name: "Smart Switchable Glass Panel", nameAr: "لوح زجاج ذكي إلكتروني قابل للتحويل", description: "Switchable smart glass", descriptionAr: "لوح زجاج ذكي تكنولوجي يتحول من شفاف إلى معتم كلياً بضغطة زر واحدة", price: 5500, salePrice: null, categoryId: 6, image: "/images/glass-products-hero_91b8e903.jpg", stock: 3, isFeatured: true, rating: 5.0, reviewCount: 20, sku: "GLS-005", isActive: true },
  { id: 48, name: "Tinted Grey Securit Panel 12mm", nameAr: "لوح زجاج سيكوريت رمادي فاميه 12 مم", description: "Tinted grey tempered glass", descriptionAr: "لوح زجاج سيكوريت رمادي أنيق عازل لأشعة الشمس والحرارة", price: 2400, salePrice: null, categoryId: 6, image: "/images/glass-products-hero_91b8e903.jpg", stock: 14, isFeatured: false, rating: 4.7, reviewCount: 13, sku: "GLS-006", isActive: true },
  { id: 49, name: "Fluted Reeded Decorative Glass", nameAr: "لوح زجاج مضلع ريبد ديكوري فاخر", description: "Fluted textured glass panel", descriptionAr: "لوح زجاج ديكوري مضلع بخطوط طولية مميزة يضفي لمسة عصرية للأبواب", price: 2100, salePrice: null, categoryId: 6, image: "/images/glass-products-hero_91b8e903.jpg", stock: 18, isFeatured: false, rating: 4.8, reviewCount: 11, sku: "GLS-007", isActive: true },
  { id: 50, name: "Acoustic Triple-Glazed Securit Panel", nameAr: "لوح زجاج سيكوريت ثلاثي عازل تام للصوت", description: "Acoustic triple glass panel", descriptionAr: "لوح زجاجي ثلاثي الطبقات مع غاز الأرجون لعزل الضوضاء والصوت بنسبة 99%", price: 3600, salePrice: null, categoryId: 6, image: "/images/glass-products-hero_91b8e903.jpg", stock: 9, isFeatured: false, rating: 4.9, reviewCount: 25, sku: "GLS-008", isActive: true },
];

export async function seedCategories() {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const existing = await db.select().from(categories).limit(1);
  if (existing.length > 0) return;
  const cats = [
    { name: "Door Handles", nameAr: "مقابض الأبواب", description: "High-quality glass door handles", icon: "DoorOpen", image: "/images/glass-door-product_113bd9cd.jpg" },
    { name: "Shower Accessories", nameAr: "اكسسوارات الدوش", description: "Glass shower hardware", icon: "ShowerHead", image: "/images/glass-shower_83a35009.jpg" },
    { name: "Glass Locks", nameAr: "كوالين الزجاج", description: "Multi-size glass locks", icon: "Lock", image: "/images/glass-products-hero_79a48c05.jpg" },
    { name: "Door Hinges", nameAr: "مفصلات الأبواب", description: "Floor and ceiling hinges", icon: "GripHorizontal", image: "/images/category-banner_dbe4fbaa.jpg" },
    { name: "Installation Parts", nameAr: "قطع التركيب", description: "Professional screws and bolts", icon: "Wrench", image: "/images/about-section_2b2aaa4a (1).jpg" },
    { name: "Glass Panels", nameAr: "ألواح زجاجية", description: "Tempered and laminated glass", icon: "Square", image: "/images/glass-products-hero_91b8e903.jpg" },
  ];
  for (const cat of cats) await db.insert(categories).values(cat);
}

export async function seedProducts() {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const existing = await db.select().from(products).limit(1);
  if (existing.length > 0) return;
  for (const p of DEFAULT_50_PRODUCTS) {
    const { id, ...data } = p;
    await db.insert(products).values(data as any);
  }
}


