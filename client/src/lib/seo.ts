const fallbackSiteUrl = "https://mousaglass-393f3nnk.manus.space";

export function siteUrl() {
  return typeof window === "undefined" ? fallbackSiteUrl : window.location.origin;
}

export function organizationJsonLd(input: { isCatalogStaging?: boolean; storeName?: string; whatsappNumber?: string | null }) {
  if (input.isCatalogStaging !== false) return null;
  const contactPoint = input.whatsappNumber?.replace(/\D/g, "");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.storeName || "موسى",
    url: siteUrl(),
    logo: `${siteUrl()}/manus-storage/pasted_file_nStI0h_WhatsAppImage2026-08-01at8.25.58PM_d193407d_32f06135.jpeg`,
    areaServed: { "@type": "AdministrativeArea", name: "الغردقة، البحر الأحمر، مصر" },
    ...(contactPoint ? { contactPoint: { "@type": "ContactPoint", telephone: `+${contactPoint}`, contactType: "customer service", availableLanguage: "ar" } } : {}),
  };
}

export function productJsonLd(input: { isCatalogStaging?: boolean; product: { slug: string; name: string; description?: string | null; priceAmount: number; stock: number; images: Array<{ url: string }> } }) {
  if (input.isCatalogStaging !== false) return null;
  const product = input.product;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.images.map(image => image.url),
    url: `${siteUrl()}/products/${encodeURIComponent(product.slug)}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: (product.priceAmount / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl()}/products/${encodeURIComponent(product.slug)}`,
    },
  };
}
