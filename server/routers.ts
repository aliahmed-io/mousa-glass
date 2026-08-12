import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getCategories, getProducts, getProductById, getFeaturedProducts, getAllProducts,
  createProduct, updateProduct, deleteProduct,
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
  createOrder, createOrderItem, getOrders, getAllOrders, getOrderById, updateOrderStatus,
  getReviews, createReview, getReviewsForAdmin, approveReview, deleteReview,
  getDashboardStats, seedCategories, seedProducts,
} from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ========== CATEGORIES ==========
  categories: router({
    list: publicProcedure.query(async () => {
      return getCategories();
    }),
  }),

  // ========== PRODUCTS ==========
  products: router({
    list: publicProcedure.input(z.object({
      search: z.string().optional(),
      categoryId: z.number().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      sortBy: z.enum(["newest", "price_low", "price_high", "rating", "name"]).optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    })).query(async ({ input }) => {
      return getProducts(input);
    }),
    featured: publicProcedure.query(async () => {
      return getFeaturedProducts();
    }),
    byId: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getProductById(input.id);
    }),
    all: adminProcedure.query(async () => {
      return getAllProducts();
    }),
    create: adminProcedure.input(z.object({
      name: z.string(), nameAr: z.string(), description: z.string().optional(),
      descriptionAr: z.string().optional(), price: z.number(), salePrice: z.number().optional(),
      image: z.string(), images: z.string().optional(), categoryId: z.number(),
      sku: z.string().optional(), stock: z.number().optional(), isActive: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      await createProduct({ ...input, rating: 0, reviewCount: 0 });
      return { success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), nameAr: z.string().optional(),
      description: z.string().optional(), descriptionAr: z.string().optional(),
      price: z.number().optional(), salePrice: z.number().optional(),
      image: z.string().optional(), categoryId: z.number().optional(),
      sku: z.string().optional(), stock: z.number().optional(),
      isActive: z.boolean().optional(), isFeatured: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProduct(id, data);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteProduct(input.id);
      return { success: true };
    }),
  }),

  // ========== CART ==========
  cart: router({
    get: publicProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id ?? 0;
      return getCart(userId);
    }),
    add: publicProcedure.input(z.object({ productId: z.number(), quantity: z.number().min(1) })).mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? 0;
      await addToCart(userId, input.productId, input.quantity);
      return { success: true };
    }),
    update: publicProcedure.input(z.object({ cartId: z.number(), quantity: z.number() })).mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? 0;
      await updateCartItem(input.cartId, input.quantity, userId);
      return { success: true };
    }),
    remove: publicProcedure.input(z.object({ cartId: z.number() })).mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? 0;
      await removeFromCart(input.cartId, userId);
      return { success: true };
    }),
    clear: publicProcedure.mutation(async ({ ctx }) => {
      const userId = ctx.user?.id ?? 0;
      await clearCart(userId);
      return { success: true };
    }),
  }),

  // ========== ORDERS ==========
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getOrders(ctx.user.id);
    }),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const order = await getOrderById(input.id);
      if (!order || (order as any).userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'لا يمكنك الوصول لهذا الطلب' });
      }
      return order;
    }),
    create: publicProcedure.input(z.object({
      items: z.array(z.object({ productId: z.number(), quantity: z.number(), name: z.string(), nameAr: z.string(), price: z.number(), image: z.string() })),
      total: z.number(), shippingFee: z.number(),
      customerName: z.string(), customerPhone: z.string(), customerEmail: z.string().optional(),
      shippingAddress: z.string(), city: z.string().optional(), notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? 0;
      // Create order
      const orderResult = await createOrder({
        userId, total: input.total, shippingFee: input.shippingFee,
        customerName: input.customerName, customerPhone: input.customerPhone,
        customerEmail: input.customerEmail, shippingAddress: input.shippingAddress,
        city: input.city, notes: input.notes,
      });
      const orderId = (orderResult as any)?.lastInsertId ?? 0;

      // Create order items
      for (const item of input.items) {
        await createOrderItem({
          orderId, productId: item.productId, name: item.name, nameAr: item.nameAr,
          price: item.price, quantity: item.quantity, image: item.image,
        });
      }

      // Clear cart
      await clearCart(userId);
      return { success: true, orderId };
    }),
    // Admin
    all: adminProcedure.query(async () => {
      return getAllOrders();
    }),
    byIdAdmin: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getOrderById(input.id);
    }),
    updateStatus: adminProcedure.input(z.object({ id: z.number(), status: z.string() })).mutation(async ({ input }) => {
      await updateOrderStatus(input.id, input.status);
      return { success: true };
    }),
  }),

  // ========== REVIEWS ==========
  reviews: router({
    byProduct: publicProcedure.input(z.object({ productId: z.number() })).query(async ({ input }) => {
      return getReviews(input.productId);
    }),
    create: publicProcedure.input(z.object({
      productId: z.number(), rating: z.number().min(1).max(5),
      comment: z.string().optional(), commentAr: z.string().optional(),
      customerName: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      await createReview({ ...input, userId: ctx.user?.id ?? 0 });
      return { success: true };
    }),
    // Admin
    all: adminProcedure.query(async () => {
      return getReviewsForAdmin();
    }),
    approve: adminProcedure.input(z.object({ id: z.number(), isApproved: z.boolean() })).mutation(async ({ input }) => {
      await approveReview(input.id, input.isApproved);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteReview(input.id);
      return { success: true };
    }),
  }),

  // ========== ADMIN DASHBOARD ==========
  admin: router({
    stats: adminProcedure.query(async () => {
      return getDashboardStats();
    }),
    seed: adminProcedure.mutation(async () => {
      await seedCategories();
      await seedProducts();
      return { success: true, message: "Seed data applied" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
