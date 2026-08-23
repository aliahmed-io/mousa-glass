import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addPaymentProof,
  addProductImage,
  createCategory,
  createCheckoutOrder,
  createProduct,
  deletePaymentProof,
  deleteCategory,
  deleteProduct,
  deleteProductImage,
  getAdminProducts,
  getAllOrders,
  getCategories,
  getCatalogProducts,
  getDashboardMetrics,
  getOrderById,
  getOrderForUser,
  getOrdersForUser,
  getProductById,
  getProductBySlug,
  getStoreSettings,
  updateCategory,
  updateOrder,
  updateProduct,
  updateStoreSettings,
} from "./db";
import { storagePut } from "./storage";
import { notifyOwnerNonBlocking, orderAlertPayload, paymentProofAlertPayload } from "./_core/operations";

const catalogQuery = z.object({
  search: z.string().trim().max(100).optional(),
  categorySlug: z.string().trim().max(140).optional(),
  featuredOnly: z.boolean().optional(),
  sort: z.enum(["featured", "newest", "price_asc", "price_desc", "name_asc"]).default("featured"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(48).default(12),
});

const productInput = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.").max(220),
  description: z.string().trim().max(10000).nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  priceAmount: z.number().int().min(0).max(100000000),
  stock: z.number().int().min(0).max(1000000),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const orderStatus = z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]);
const paymentStatus = z.enum(["not_required", "awaiting_proof", "under_review", "verified", "rejected"]);
const imageDataSchema = z
  .string()
  .max(7_000_000, "Images must be 5 MB or smaller.")
  .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\s]+$/, "Upload a PNG, JPEG, or WebP image.");

function paymentWhatsappUrl(whatsappNumber: string, orderNumber: string, type: "created" | "proof_submitted") {
  const text = type === "created"
    ? `Hello Mousa Glass, I placed order ${orderNumber}. Please confirm my order.`
    : `Hello Mousa Glass, I submitted the InstaPay proof for order ${orderNumber}. Please confirm receipt.`;
  return `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

function decodeImage(dataUrl: string) {
  const [header, encoded] = dataUrl.split(",", 2);
  const mimeType = header.match(/^data:(image\/(?:png|jpeg|webp));base64$/)?.[1];
  if (!mimeType || !encoded) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid image data." });
  const data = Buffer.from(encoded, "base64");
  if (data.length === 0 || data.length > 5 * 1024 * 1024) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Images must be 5 MB or smaller." });
  }
  const isPng = data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  const isWebp = data.length >= 12 && data.subarray(0, 4).equals(Buffer.from("RIFF")) && data.subarray(8, 12).equals(Buffer.from("WEBP"));
  if ((mimeType === "image/png" && !isPng) || (mimeType === "image/jpeg" && !isJpeg) || (mimeType === "image/webp" && !isWebp)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The uploaded bytes do not match the declared image format." });
  }
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return { data, mimeType, extension };
}

function fileStem(name: string) {
  return name.toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "image";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  store: router({
    settings: publicProcedure.query(() => getStoreSettings()),
  }),

  categories: router({
    list: publicProcedure.query(() => getCategories()),
    adminList: adminProcedure.query(() => getCategories(true)),
    create: adminProcedure
      .input(z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140), description: z.string().trim().max(1000).nullable().optional(), isActive: z.boolean().default(true), sortOrder: z.number().int().min(0).max(10000).default(0) }))
      .mutation(async ({ input }) => ({ id: await createCategory(input) })),
    update: adminProcedure
      .input(z.object({ id: z.number().int().positive(), name: z.string().trim().min(2).max(120).optional(), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140).optional(), description: z.string().trim().max(1000).nullable().optional(), isActive: z.boolean().optional(), sortOrder: z.number().int().min(0).max(10000).optional() }))
      .mutation(async ({ input }) => {
        const { id, ...changes } = input;
        await updateCategory(id, changes);
        return { success: true };
      }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await deleteCategory(input.id);
      return { success: true };
    }),
  }),

  products: router({
    list: publicProcedure.input(catalogQuery).query(({ input }) => getCatalogProducts(input)),
    bySlug: publicProcedure.input(z.object({ slug: z.string().trim().min(1).max(220) })).query(({ input }) => getProductBySlug(input.slug)),
    adminList: adminProcedure.query(() => getAdminProducts()),
    create: adminProcedure.input(productInput).mutation(async ({ input }) => ({ id: await createProduct(input) })),
    update: adminProcedure.input(productInput.partial().extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const { id, ...changes } = input;
      if (!Object.keys(changes).length) throw new TRPCError({ code: "BAD_REQUEST", message: "No product changes were supplied." });
      await updateProduct(id, changes);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      try {
        await deleteProduct(input.id);
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Product deletion was rejected." });
      }
      return { success: true };
    }),
    uploadImage: adminProcedure
      .input(z.object({ productId: z.number().int().positive(), fileName: z.string().trim().min(1).max(255), imageData: imageDataSchema, altText: z.string().trim().max(255).nullable().optional(), sortOrder: z.number().int().min(0).max(100).default(0) }))
      .mutation(async ({ input }) => {
        const product = await getProductById(input.productId, true);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
        const image = decodeImage(input.imageData);
        const stored = await storagePut(`products/${input.productId}/${fileStem(input.fileName)}.${image.extension}`, image.data, image.mimeType);
        await addProductImage({ productId: input.productId, storageKey: stored.key, url: stored.url, altText: input.altText ?? null, sortOrder: input.sortOrder });
        return stored;
      }),
    deleteImage: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await deleteProductImage(input.id);
      return { success: true };
    }),
  }),

  orders: router({
    create: protectedProcedure
      .input(z.object({
        customerName: z.string().trim().min(2).max(160),
        customerPhone: z.string().trim().min(7).max(40),
        customerEmail: z.string().trim().email().max(320).nullable().optional(),
        shippingAddress: z.string().trim().min(8).max(2000),
        notes: z.string().trim().max(1500).nullable().optional(),
        paymentMethod: z.enum(["cash_on_delivery", "instapay"]),
        items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).min(1).max(50),
        idempotencyKey: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const settings = await getStoreSettings();
        if (settings.isCatalogStaging) {
          throw new TRPCError({ code: "FORBIDDEN", message: "The generated staging catalog does not accept customer orders." });
        }
        if (input.paymentMethod === "instapay" && settings.paymentProofRetentionDays === null) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "InstaPay orders are unavailable until the payment-proof retention policy is configured by an administrator." });
        }
        try {
          const order = await createCheckoutOrder({ ...input, userId: ctx.user.id });
          notifyOwnerNonBlocking(orderAlertPayload({ orderId: order.orderId, orderNumber: order.orderNumber, paymentMethod: input.paymentMethod }));
          return { ...order, whatsappUrl: paymentWhatsappUrl(settings.whatsappNumber, order.orderNumber, "created"), instaPayHandle: settings.instaPayHandle };
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to create the order." });
        }
      }),
    mine: protectedProcedure.query(({ ctx }) => getOrdersForUser(ctx.user.id)),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const order = await getOrderForUser(input.id, ctx.user.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      return order;
    }),
    uploadPaymentProof: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), fileName: z.string().trim().min(1).max(255), imageData: imageDataSchema }))
      .mutation(async ({ ctx, input }) => {
        const order = await getOrderForUser(input.id, ctx.user.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
        if (order.paymentMethod !== "instapay") throw new TRPCError({ code: "BAD_REQUEST", message: "This order does not require an InstaPay proof." });
        if (order.status === "cancelled") throw new TRPCError({ code: "BAD_REQUEST", message: "A proof cannot be added to a cancelled order." });
        const image = decodeImage(input.imageData);
        const stored = await storagePut(`payment-proofs/${order.orderNumber}/${fileStem(input.fileName)}.${image.extension}`, image.data, image.mimeType);
        await addPaymentProof({ orderId: order.id, storageKey: stored.key, url: stored.url, originalFilename: input.fileName, mimeType: image.mimeType });
        notifyOwnerNonBlocking(paymentProofAlertPayload({ orderId: order.id, orderNumber: order.orderNumber }));
        const settings = await getStoreSettings();
        return { success: true, whatsappUrl: paymentWhatsappUrl(settings.whatsappNumber, order.orderNumber, "proof_submitted") };
      }),
  }),

  admin: router({
    dashboard: adminProcedure.query(() => getDashboardMetrics()),
    orders: adminProcedure
      .input(z.object({ status: orderStatus.optional(), paymentStatus: paymentStatus.optional(), query: z.string().trim().max(120).optional(), limit: z.number().int().min(1).max(200).optional() }).optional())
      .query(({ input }) => getAllOrders(input ?? {})),
    order: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const order = await getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      return order;
    }),
    updateOrder: adminProcedure
      .input(z.object({ id: z.number().int().positive(), status: orderStatus.optional(), paymentStatus: paymentStatus.optional() }))
      .mutation(async ({ input }) => {
        if (!input.status && !input.paymentStatus) throw new TRPCError({ code: "BAD_REQUEST", message: "No order changes were supplied." });
        try {
          await updateOrder(input);
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Order update was rejected." });
        }
        return { success: true };
      }),
    storeSettings: adminProcedure.query(() => getStoreSettings()),
    updateStoreSettings: adminProcedure
      .input(z.object({ storeName: z.string().trim().min(2).max(120).optional(), whatsappNumber: z.string().trim().min(7).max(30).optional(), instaPayHandle: z.string().trim().max(160).nullable().optional(), shippingFeeAmount: z.number().int().min(0).max(10000000).optional(), isCatalogStaging: z.boolean().optional(), paymentProofRetentionDays: z.number().int().min(1).max(3650).nullable().optional() }))
      .mutation(({ input }) => updateStoreSettings(input)),
    deletePaymentProof: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await deletePaymentProof(input.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
