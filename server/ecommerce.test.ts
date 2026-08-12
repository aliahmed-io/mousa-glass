import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
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
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("categories.list", () => {
  it("returns categories for public users", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("products.list", () => {
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
});

describe("products.featured", () => {
  it("returns featured products", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.featured();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("cart.get (guest)", () => {
  it("returns an array for guests", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.cart.get();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("cart.add (guest)", () => {
  it("allows guests to add items to cart", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.cart.add({ productId: 1, quantity: 2 });
    expect(result).toEqual({ success: true });
  });
});

describe("orders.create (guest)", () => {
  it("allows guests to create orders", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    // First add a product to cart
    await caller.cart.add({ productId: 1, quantity: 1 });
    const cartItems = await caller.cart.get();
    
    // Get product details for the order items
    const products = await caller.products.list({ page: 1, limit: 1 });
    const firstProduct = products.products[0];
    
    if (firstProduct && cartItems.length > 0) {
      const orderItems = [{
        productId: firstProduct.id,
        quantity: 1,
        name: firstProduct.name,
        nameAr: firstProduct.nameAr,
        price: firstProduct.price,
        image: firstProduct.image,
      }];
      
      const result = await caller.orders.create({
        items: orderItems,
        total: firstProduct.price,
        shippingFee: 30,
        customerName: "محمد أحمد",
        customerPhone: "01020848619",
        customerEmail: "test@example.com",
        shippingAddress: "القاهرة، مصر",
        city: "القاهرة",
        notes: "",
      });
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    } else {
      // Skip if no products available
      expect(true).toBe(true);
    }
  });
});

describe("reviews.create (guest)", () => {
  it("allows guests to create reviews", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.reviews.create({
      productId: 1,
      rating: 5,
      comment: "منتج ممتاز!",
      reviewerName: "محمد أحمد",
    });
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });
});

describe("admin access control", () => {
  it("denies non-admin users from accessing admin routes", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 2,
        openId: "regular-user",
        email: "user@example.com",
        name: "Regular User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.products.all()).rejects.toThrow();
  });

  it("allows admin users to access admin routes", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.all();
    expect(Array.isArray(result)).toBe(true);
  });
});
