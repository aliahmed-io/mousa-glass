import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const readProjectFile = (relativePath: string) => readFileSync(`${projectRoot}/${relativePath}`, "utf8");

describe("public storefront routes", () => {
  it("registers the essential customer-information pages as lazy routes", () => {
    const app = readProjectFile("client/src/App.tsx");

    expect(app).toContain('path="/about"');
    expect(app).toContain('path="/contact"');
    expect(app).toContain('path="/delivery&returns"');
    expect(app).toContain('path="/faq"');
    expect(app).toContain('const About = lazy');
    expect(app).toContain('const Contact = lazy');
  });

  it("keeps customer navigation and crawler entry points discoverable", () => {
    const layout = readProjectFile("client/src/components/StoreLayout.tsx");
    const robots = readProjectFile("client/public/robots.txt");
    const llms = readProjectFile("client/public/llms.txt");

    expect(layout).toContain('aria-label="التنقل الرئيسي"');
    expect(layout).toContain('href="/contact"');
    expect(layout).toContain('href="/faq"');
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Disallow: /admin");
    expect(llms).toContain("## Public pages");
  });

  it("publishes a clearly non-binding Arabic policy-status route without presenting unapproved terms", () => {
    const app = readProjectFile("client/src/App.tsx");
    const layout = readProjectFile("client/src/components/StoreLayout.tsx");
    const policyStatus = readProjectFile("client/src/pages/PolicyStatus.tsx");

    expect(app).toContain('path="/policy-status"');
    expect(app).toContain('const PolicyStatus = lazy');
    expect(layout).toContain('href="/policy-status"');
    expect(policyStatus).toContain("هذه الصفحة توضح ما لم يُعتمد بعد");
    expect(policyStatus).toContain("إنها ليست سياسة خصوصية أو شروط بيع أو عرضاً تعاقدياً");
    expect(policyStatus).toContain("قيد الاعتماد");
    expect(policyStatus).toContain("إنشاء الطلبات الحقيقية معطّل");
  });

  it("does not load unused global toast or tooltip providers in the public application entry", () => {
    const app = readProjectFile("client/src/App.tsx");
    const showcase = readProjectFile("client/src/pages/ComponentShowcase.tsx");

    expect(app).not.toContain("TooltipProvider");
    expect(app).not.toContain("Toaster");
    expect(app).not.toContain("from \"sonner\"");
    expect(showcase).toContain('import { toast as sonnerToast } from "sonner"');
    expect(app).not.toContain("ComponentShowcase");
  });

  it("keeps routed administrator sources independent of the removed root toast and tooltip providers", () => {
    const dashboard = readProjectFile("client/src/pages/AdminDashboard.tsx");
    const categories = readProjectFile("client/src/pages/AdminCategories.tsx");
    const media = readProjectFile("client/src/pages/AdminMedia.tsx");
    const layout = readProjectFile("client/src/components/DashboardLayout.tsx");

    for (const source of [dashboard, categories, media, layout]) {
      expect(source).not.toContain('from "sonner"');
      expect(source).not.toContain("TooltipProvider");
      expect(source).not.toContain('from "@/components/ui/tooltip"');
    }
  });

  it("uses the shared server-confirmed administrator authorization gate across every administrator entrypoint", () => {
    const dashboard = readProjectFile("client/src/pages/AdminDashboard.tsx");
    const categories = readProjectFile("client/src/pages/AdminCategories.tsx");
    const media = readProjectFile("client/src/pages/AdminMedia.tsx");
    const gate = readProjectFile("client/src/components/AdminAccessGate.tsx");

    for (const source of [dashboard, categories, media]) {
      expect(source).toContain('from "@/_core/hooks/useAdminAccess"');
      expect(source).toContain("<AdminAccessGate");
      expect(source).not.toContain('user?.role !== "admin"');
    }
    expect(gate).toContain("trpc.auth.authorizeAdmin.useMutation");
    expect(gate).toContain("type=\"password\"");
    expect(gate).not.toContain("ADMIN_ACCESS_PASSPHRASE");
  });

  it("keeps the responsive staging category-banner source set and viewport sizing metadata", () => {
    const home = readProjectFile("client/src/pages/Home.tsx");

    expect(home).toContain("mousa-glass-category-banner-768_5b2bd47a.webp");
    expect(home).toContain("mousa-glass-category-banner-960_fce01c36.webp");
    expect(home).toContain("srcSet={`");
    expect(home).toContain("768w");
    expect(home).toContain("960w");
    expect(home).toContain('sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"');
  });

  it("uses documented 480px and measured 720px/800px derivatives for staged card images without changing catalog data", () => {
    const shop = readProjectFile("client/src/pages/Shop.tsx");
    const home = readProjectFile("client/src/pages/Home.tsx");
    const responsiveImages = readProjectFile("client/src/lib/responsiveStagingImages.ts");

    expect(shop).toContain('import { responsiveStagingProductImage } from "@/lib/responsiveStagingImages"');
    expect(shop).toContain("function ShopCardImage");
    expect(shop).toContain("<ShopCardImage url={primaryImage(product.images)}");
    expect(shop).toContain('const shouldPrioritizeImage = index < 4;');
    expect(shop).toContain('loading={prioritize ? "eager" : "lazy"}');
    expect(shop).toContain('fetchPriority={prioritize ? "high" : "auto"}');
    expect(shop).toContain("جارٍ تحميل صورة المنتج");
    expect(shop).toContain('aria-busy={!isLoaded}');
    expect(shop).toContain('onLoad={() => setStatus("loaded")}');
    expect(shop).toContain('onError={() => setStatus("error")}');
    expect(home).toContain('import { responsiveStagingProductImage } from "@/lib/responsiveStagingImages"');
    expect(home).toContain("<img {...responsiveStagingProductImage(primaryImage(product.images))}");
    expect(responsiveImages).toContain("mousa-glass-staging-amber-vase-480_2b5a53c5.webp");
    expect(responsiveImages).toContain("mousa-glass-staging-amber-glassware-480_0fabe6c3.webp");
    expect(responsiveImages).toContain("mousa-glass-staging-amber-glassware-720_441c281f.webp");
    expect(responsiveImages).toContain("mousa-glass-staging-amber-glassware-800_1dd3b6d6.webp");
    expect(responsiveImages).toContain("480w");
    expect(responsiveImages).toContain("720w");
    expect(responsiveImages).toContain("800w");
    expect(responsiveImages).toContain("960w");
    expect(responsiveImages).toContain("(max-width: 639px)");
  });

  it("retains an explicit main landmark around the Shop catalog content", () => {
    const shop = readProjectFile("client/src/pages/Shop.tsx");

    expect(shop).toContain('<main id="main-content" role="main"');
  });

  it("requires explicit selection for variant-bearing products and keeps comparison prices transparent", () => {
    const shop = readProjectFile("client/src/pages/Shop.tsx");
    const detail = readProjectFile("client/src/pages/ProductDetail.tsx");
    const dashboard = readProjectFile("client/src/pages/AdminDashboard.tsx");

    expect(shop).toContain("const hasVariants = product.variants.some");
    expect(shop).toContain("اختر التكوين");
    expect(shop).toContain("product.compareAtAmount");
    expect(detail).toContain("variantId");
    expect(dashboard).toContain("رمز المنتج SKU");
    expect(dashboard).toContain("سعر المقارنة");
    expect(dashboard).toContain("function VariantManager");
    expect(dashboard).toContain("trpc.products.createVariant.useMutation");
    expect(dashboard).toContain("trpc.products.updateVariant.useMutation");
    expect(dashboard).toContain("trpc.products.deleteVariant.useMutation");
    expect(dashboard).toContain("لا يمكن حذف تكوين مستخدم في سجل طلبات");
    expect(dashboard).toContain("بيانات QA مولّدة");
    expect(dashboard).toContain("لا تمثل مبيعات أو عملاء أو مدفوعات حقيقية");
  });

  it("keeps synthetic fixture seeding staging-guarded and clearly marked as non-customer data", () => {
    const seed = readProjectFile("scripts/seed-staging-fixtures.mjs");

    expect(seed).toContain('ALLOW_STAGING_FIXTURE_SEED=true');
    expect(seed).toContain("Refusing to seed fixtures because catalog staging is not enabled.");
    expect(seed).toContain("عميل اختبار داخلي — لا يمثل عميلاً");
    expect(seed).toContain("customer ordering remains blocked by store settings");
    expect(seed).toContain("mousa-staging-pivot-hinge-960_a720bd2c.webp");
  });

  it("keeps development and production SPA fallbacks compatible with Express 5", () => {
    const viteServer = readProjectFile("server/_core/vite.ts");

    expect(viteServer).toContain('app.use("/{*splat}"');
    expect(viteServer).not.toContain('app.use("*"');
    expect(viteServer).not.toContain("app.use('*'");
  });

  it("reserves staging-disclosure space when a future authorized non-staging setting resolves", () => {
    const layout = readProjectFile("client/src/components/StoreLayout.tsx");

    expect(layout).toContain('aria-hidden={!isCatalogStaging}');
    expect(layout).toContain('isCatalogStaging ? "" : "invisible"');
    expect(layout).toContain('border-transparent bg-transparent text-transparent');
    expect(layout).toContain('isCatalogStaging ? "" : "invisible"');
    expect(layout).toContain('aria-live={isCatalogStaging ? "polite" : undefined}');
  });
});
