import type { Express, Request, Response, NextFunction } from "express";
import { getCatalogProducts, getStoreSettings } from "../db";

const publicPaths = ["/", "/shop", "/about", "/contact", "/delivery-returns", "/faq"];
const privatePaths = ["/admin", "/orders", "/cart", "/checkout"];

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);
}

export function getPublicBaseUrl(req: Request) {
  const configured = process.env.PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured && /^https:\/\/[a-z0-9.-]+(?:\:[0-9]+)?$/i.test(configured)) return configured;
  return "https://mousaglass-393f3nnk.manus.space";
}

export function isStagingCatalogPath(path: string) {
  return path === "/shop" || path.startsWith("/products/");
}

export function createRobotsTxt(baseUrl: string, isCatalogStaging: boolean) {
  const lines = ["User-agent: *", "Allow: /"];
  for (const path of privatePaths) lines.push(`Disallow: ${path}`);
  if (isCatalogStaging) {
    lines.push("Disallow: /shop");
    lines.push("Disallow: /products/");
  }
  lines.push(`Sitemap: ${baseUrl}/sitemap.xml`);
  return `${lines.join("\n")}\n`;
}

export function createSitemapXml(baseUrl: string, paths: string[]) {
  const urls = paths.map(path => `  <url><loc>${escapeXml(`${baseUrl}${path}`)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function getSitemapPaths(isCatalogStaging: boolean, productSlugs: string[]) {
  const paths = isCatalogStaging ? publicPaths.filter(path => path !== "/shop") : [...publicPaths];
  if (!isCatalogStaging) paths.push(...productSlugs.map(slug => `/products/${encodeURIComponent(slug)}`));
  return paths;
}

export function registerCrawlerRoutes(app: Express) {
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    try {
      const settings = await getStoreSettings();
      if (settings.isCatalogStaging && isStagingCatalogPath(req.path)) {
        res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      }
      return next();
    } catch {
      return next();
    }
  });

  app.get("/robots.txt", async (req, res) => {
    const settings = await getStoreSettings();
    res.type("text/plain").setHeader("Cache-Control", "public, max-age=300");
    res.send(createRobotsTxt(getPublicBaseUrl(req), settings.isCatalogStaging));
  });

  app.get("/sitemap.xml", async (req, res) => {
    const settings = await getStoreSettings();
    const { products } = settings.isCatalogStaging
      ? { products: [] }
      : await getCatalogProducts({ page: 1, limit: 500, sort: "newest" });
    const paths = getSitemapPaths(settings.isCatalogStaging, products.map(product => product.slug));
    res.type("application/xml").setHeader("Cache-Control", "public, max-age=300");
    res.send(createSitemapXml(getPublicBaseUrl(req), paths));
  });
}
