import { describe, expect, it } from "vitest";
import { createRobotsTxt, createSitemapXml, getSitemapPaths, isStagingCatalogPath } from "./_core/crawler";

describe("crawler policy", () => {
  it("blocks generated catalog URLs while retaining public information pages", () => {
    const robots = createRobotsTxt("https://store.example", true);
    expect(robots).toContain("Disallow: /shop");
    expect(robots).toContain("Disallow: /products/");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Sitemap: https://store.example/sitemap.xml");
    expect(isStagingCatalogPath("/products/sample-glass")).toBe(true);
    expect(isStagingCatalogPath("/about")).toBe(false);
  });

  it("emits escaped canonical sitemap URLs", () => {
    const sitemap = createSitemapXml("https://store.example", ["/", "/products/a&b"]);
    expect(sitemap).toContain("https://store.example/products/a&amp;b");
    expect(sitemap).toContain("<urlset");
  });

  it("excludes generated shop and product pages from the staging sitemap", () => {
    expect(getSitemapPaths(true, ["seed-mirror"])).not.toContain("/shop");
    expect(getSitemapPaths(true, ["seed-mirror"])).not.toContain("/products/seed-mirror");
    expect(getSitemapPaths(false, ["approved-mirror"])).toEqual(expect.arrayContaining(["/shop", "/products/approved-mirror"]));
  });
});
