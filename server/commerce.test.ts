import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  addPaymentProof: vi.fn(),
  addProductImage: vi.fn(),
  createCategory: vi.fn(),
  createCheckoutOrder: vi.fn(),
  createProduct: vi.fn(),
  deleteCategory: vi.fn(),
  deleteProduct: vi.fn(),
  deleteProductImage: vi.fn(),
  getAdminProducts: vi.fn(),
  getAllOrders: vi.fn(),
  getCategories: vi.fn(),
  getCatalogProducts: vi.fn(),
  getDashboardMetrics: vi.fn(),
  getOrderById: vi.fn(),
  getOrderForUser: vi.fn(),
  getOrdersForUser: vi.fn(),
  getProductById: vi.fn(),
  getProductBySlug: vi.fn(),
  getStoreSettings: vi.fn(),
  updateCategory: vi.fn(),
  updateOrder: vi.fn(),
  updateProduct: vi.fn(),
  updateStoreSettings: vi.fn(),
}));

const storageMocks = vi.hoisted(() => ({ storagePut: vi.fn() }));

vi.mock("./db", () => dbMocks);
vi.mock("./storage", () => storageMocks);

import { appRouter } from "./routers";

function context(role: "admin" | "user" = "user"): TrpcContext {
  return {
    user: {
      id: role === "admin" ? 1 : 2,
      openId: `${role}-id`,
      name: `${role} user`,
      email: `${role}@example.com`,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const productInput = {
  name: "Brass glass handle",
  slug: "brass-glass-handle",
  description: "A tested product description.",
  categoryId: null,
  priceAmount: 12500,
  stock: 12,
  isActive: true,
  isFeatured: false,
};

describe("commerce tRPC procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getStoreSettings.mockResolvedValue({ whatsappNumber: "201020848619", instaPayHandle: "01060223037", shippingFeeAmount: 0 });
  });

  it("allows administrators to create a catalog product", async () => {
    dbMocks.createProduct.mockResolvedValue(17);
    const result = await appRouter.createCaller(context("admin")).products.create(productInput);
    expect(result).toEqual({ id: 17 });
    expect(dbMocks.createProduct).toHaveBeenCalledWith(productInput);
  });

  it("rejects product administration for a customer account", async () => {
    await expect(appRouter.createCaller(context("user")).products.create(productInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.createProduct).not.toHaveBeenCalled();
  });

  it("allows an administrator to update inventory without changing other fields", async () => {
    await appRouter.createCaller(context("admin")).products.update({ id: 17, stock: 4 });
    expect(dbMocks.updateProduct).toHaveBeenCalledWith(17, { stock: 4, isActive: true, isFeatured: false });
  });

  it("passes customer category filters and Arabic catalog sort selections to the database layer", async () => {
    dbMocks.getCatalogProducts.mockResolvedValue({ products: [], total: 0 });
    await appRouter.createCaller(context("user")).products.list({ categorySlug: "door-handles", sort: "price_asc", page: 1, limit: 24 });
    expect(dbMocks.getCatalogProducts).toHaveBeenCalledWith({ categorySlug: "door-handles", sort: "price_asc", page: 1, limit: 24 });
  });

  it("allows administrators to create and edit category name, visibility, and display order", async () => {
    dbMocks.createCategory.mockResolvedValue(9);
    await expect(appRouter.createCaller(context("admin")).categories.create({ name: "Door handles", slug: "door-handles", description: "For glass doors", isActive: true, sortOrder: 2 })).resolves.toEqual({ id: 9 });
    await appRouter.createCaller(context("admin")).categories.update({ id: 9, name: "Premium door handles", isActive: false, sortOrder: 5 });
    expect(dbMocks.updateCategory).toHaveBeenCalledWith(9, { name: "Premium door handles", isActive: false, sortOrder: 5 });
  });

  it("prevents customers from viewing dashboard analytics", async () => {
    await expect(appRouter.createCaller(context("user")).admin.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getDashboardMetrics).not.toHaveBeenCalled();
  });

  it("rejects customers from reading the administrator order workspace", async () => {
    await expect(appRouter.createCaller(context("user")).admin.orders({ status: "pending", query: "MG-100" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getAllOrders).not.toHaveBeenCalled();
  });

  it("passes admin order filters through to the database layer", async () => {
    dbMocks.getAllOrders.mockResolvedValue([]);
    await appRouter.createCaller(context("admin")).admin.orders({ status: "pending", paymentStatus: "under_review", query: "MG-100", limit: 25 });
    expect(dbMocks.getAllOrders).toHaveBeenCalledWith({ status: "pending", paymentStatus: "under_review", query: "MG-100", limit: 25 });
  });

  it("returns a detailed admin order and reports missing orders clearly", async () => {
    const detail = { id: 100, orderNumber: "MG-100", items: [], paymentProofs: [] };
    dbMocks.getOrderById.mockResolvedValue(detail);
    await expect(appRouter.createCaller(context("admin")).admin.order({ id: 100 })).resolves.toEqual(detail);
    dbMocks.getOrderById.mockResolvedValue(null);
    await expect(appRouter.createCaller(context("admin")).admin.order({ id: 404 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("creates an InstaPay order attached to the authenticated customer and returns WhatsApp handoff", async () => {
    dbMocks.createCheckoutOrder.mockResolvedValue({ id: 22, orderNumber: "MG-ORDER-22", totalAmount: 26000 });
    const result = await appRouter.createCaller(context("user")).orders.create({
      customerName: "Customer Name",
      customerPhone: "201020000000",
      customerEmail: "customer@example.com",
      shippingAddress: "24 Example Street, Cairo",
      notes: null,
      paymentMethod: "instapay",
      items: [{ productId: 5, quantity: 2 }],
    });
    expect(dbMocks.createCheckoutOrder).toHaveBeenCalledWith(expect.objectContaining({ userId: 2, paymentMethod: "instapay", items: [{ productId: 5, quantity: 2 }] }));
    expect(result).toMatchObject({ orderNumber: "MG-ORDER-22", instaPayHandle: "01060223037" });
    expect(result.whatsappUrl).toContain("201020848619");
    expect(decodeURIComponent(result.whatsappUrl)).toContain("MG-ORDER-22");
    expect(decodeURIComponent(result.whatsappUrl)).toContain("I placed order");
  });

  it("creates a Cash on Delivery order with the configured WhatsApp confirmation handoff", async () => {
    dbMocks.createCheckoutOrder.mockResolvedValue({ id: 23, orderNumber: "MG-COD-23", totalAmount: 12500 });
    const result = await appRouter.createCaller(context("user")).orders.create({
      customerName: "Cash Customer",
      customerPhone: "2010602223037",
      customerEmail: null,
      shippingAddress: "Hurghada, Red Sea",
      notes: "Cash on delivery",
      paymentMethod: "cash_on_delivery",
      items: [{ productId: 6, quantity: 1 }],
    });
    expect(dbMocks.createCheckoutOrder).toHaveBeenCalledWith(expect.objectContaining({ userId: 2, paymentMethod: "cash_on_delivery" }));
    expect(result).toMatchObject({ orderNumber: "MG-COD-23", instaPayHandle: "01060223037" });
    expect(result.whatsappUrl).toContain("https://wa.me/201020848619");
    expect(decodeURIComponent(result.whatsappUrl)).toContain("MG-COD-23");
  });

  it("stores an InstaPay proof only for the customer who owns the order", async () => {
    dbMocks.getOrderForUser.mockResolvedValue({ id: 22, orderNumber: "MG-ORDER-22", paymentMethod: "instapay", status: "pending" });
    storageMocks.storagePut.mockResolvedValue({ key: "payment-proofs/MG-ORDER-22/proof.png", url: "https://storage.example/proof.png" });
    const imageData = `data:image/png;base64,${Buffer.from("valid-image").toString("base64")}`;
    const result = await appRouter.createCaller(context("user")).orders.uploadPaymentProof({ id: 22, fileName: "proof.png", imageData });
    expect(storageMocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("payment-proofs/MG-ORDER-22"), expect.any(Buffer), "image/png");
    expect(dbMocks.addPaymentProof).toHaveBeenCalledWith(expect.objectContaining({ orderId: 22, originalFilename: "proof.png" }));
    expect(result.success).toBe(true);
    expect(result.whatsappUrl).toContain("https://wa.me/201020848619");
    expect(decodeURIComponent(result.whatsappUrl)).toContain("MG-ORDER-22");
    expect(decodeURIComponent(result.whatsappUrl)).toContain("proof for order");
  });

  it("rejects a payment proof upload when the customer does not own the order", async () => {
    dbMocks.getOrderForUser.mockResolvedValue(null);
    const imageData = `data:image/png;base64,${Buffer.from("valid-image").toString("base64")}`;
    await expect(appRouter.createCaller(context("user")).orders.uploadPaymentProof({ id: 99, fileName: "proof.png", imageData })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(storageMocks.storagePut).not.toHaveBeenCalled();
    expect(dbMocks.addPaymentProof).not.toHaveBeenCalled();
  });
});
