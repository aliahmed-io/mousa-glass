import { describe, expect, it } from "vitest";
import { organizationJsonLd, productJsonLd } from "../client/src/lib/seo";

describe("SEO structured-data guards", () => {
  const product = { slug: "approved-mirror", name: "مرآة", description: "وصف", priceAmount: 125000, stock: 3, images: [{ url: "https://example.test/mirror.jpg" }] };

  it("suppresses organization and product schema during generated-catalog staging", () => {
    expect(organizationJsonLd({ isCatalogStaging: true, storeName: "موسى" })).toBeNull();
    expect(productJsonLd({ isCatalogStaging: true, product })).toBeNull();
  });

  it("emits valid product offer data only in non-staging mode", () => {
    const schema = productJsonLd({ isCatalogStaging: false, product });
    expect(schema).toMatchObject({ "@type": "Product", name: "مرآة", offers: { priceCurrency: "EGP", price: "1250.00", availability: "https://schema.org/InStock" } });
  });
});
