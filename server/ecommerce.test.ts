import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      phone: "01020848619",
      address: "القاهرة الجديدة",
      city: "القاهرة",
      notes: "إدارة",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "customer@example.com",
      name: "محمد العميل",
      loginMethod: "manus",
      role: "user",
      phone: "01099998888",
      address: "مدينة نصر، القاهرة",
      city: "القاهرة",
      notes: "يرجى الاتصال قبل الوصول",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createGuestContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("categories router", () => {
  it("returns categories list for public users", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns categories with product counts", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.listWithCount();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin to create a category", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.create({
      name: "Glass Accessories",
      nameAr: "اكسسوارات زجاج",
      description: "فئة تجريبية",
      icon: "Sparkles",
    });
    expect(result).toEqual({ success: true });
  });

  it("denies regular user from creating category", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.categories.create({
        name: "Test",
        nameAr: "تجربة",
      })
    ).rejects.toThrow();
  });
});

describe("products router", () => {
  it("returns products with pagination for public users", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.list({ page: 1, limit: 5 });
    expect(result).toHaveProperty("products");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.products)).toBe(true);
  });

  it("filters products by search query", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.list({ search: "مقبض" });
    expect(result).toHaveProperty("products");
    expect(result).toHaveProperty("total");
  });

  it("sorts products by price low to high", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.list({ sortBy: "price_low" });
    expect(result).toHaveProperty("products");
    if (result.products.length >= 2) {
      expect(result.products[0].price).toBeLessThanOrEqual(result.products[1].price);
    }
  });

  it("returns featured products", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.featured();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("cart router", () => {
  it("returns an array for guests", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.cart.get();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows adding items to cart", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.cart.add({ productId: 1, quantity: 2 });
    expect(result).toEqual({ success: true });
  });
});

describe("orders router & payment methods", () => {
  it("creates order with Cash on Delivery (COD)", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);

    const orderItems = [{
      productId: 1,
      quantity: 2,
      name: "Glass Handle",
      nameAr: "مقبض باب زجاجي",
      price: 450,
      image: "/images/glass-door-product_113bd9cd.jpg",
    }];

    const result = await caller.orders.create({
      items: orderItems,
      total: 900,
      shippingFee: 50,
      paymentMethod: "cash",
      customerName: "أحمد علي",
      customerPhone: "01020848619",
      customerEmail: "ahmed@example.com",
      shippingAddress: "المعادي، القاهرة",
      city: "القاهرة",
      notes: "التسليم عصراً",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("orderId");
  });

  it("creates order with InstaPay payment method", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const orderItems = [{
      productId: 2,
      quantity: 1,
      name: "Shower Hinge",
      nameAr: "مفصلة دوش",
      price: 280,
      image: "/images/glass-shower_83a35009.jpg",
    }];

    const result = await caller.orders.create({
      items: orderItems,
      total: 330,
      shippingFee: 50,
      paymentMethod: "instapay",
      customerName: "محمد العميل",
      customerPhone: "01099998888",
      shippingAddress: "مدينة نصر، القاهرة",
      city: "القاهرة",
      notes: "الدفع عبر انستاباي مع المندوب",
    });

    expect(result).toHaveProperty("success", true);
  });
});

describe("reviews router", () => {
  it("allows users to submit reviews", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.reviews.create({
      productId: 1,
      rating: 5,
      comment: "جودة ممتازة وسرعة في التوصيل",
      customerName: "م. إبراهيم",
    });
    expect(result).toEqual({ success: true });
  });

  it("allows admin to moderate and approve reviews", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.reviews.approve({ id: 1, isApproved: true });
    expect(result).toEqual({ success: true });
  });
});

describe("admin dashboard & stats", () => {
  it("denies non-admin users from accessing dashboard stats", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("allows admin users to get comprehensive stats", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.admin.stats();
    expect(stats).toHaveProperty("products");
    expect(stats).toHaveProperty("orders");
    expect(stats).toHaveProperty("pendingOrders");
    expect(stats).toHaveProperty("lowStock");
    expect(stats).toHaveProperty("outOfStock");
    expect(stats).toHaveProperty("reviews");
    expect(stats).toHaveProperty("unapprovedReviews");
    expect(stats).toHaveProperty("revenue");
  });
});

describe("auth router profile update", () => {
  it("allows logged-in users to update their profile info", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.updateProfile({
      phone: "01011112222",
      address: "التجمع الخامس، القاهرة",
      city: "القاهرة",
      notes: "بجوار المسجد",
    });
    expect(result).toEqual({ success: true });
  });
});
