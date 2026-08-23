const stagedProductImage480: Record<string, string> = {
  "/manus-storage/mousa-glass-staging-amber-vase-960_a1759e41.webp": "/manus-storage/mousa-glass-staging-amber-vase-480_2b5a53c5.webp",
  "/manus-storage/mousa-glass-staging-smoked-mirror-960_2bbc7cec.webp": "/manus-storage/mousa-glass-staging-smoked-mirror-480_6da90960.webp",
  "/manus-storage/mousa-glass-staging-candleholders-960_c3670fc6.webp": "/manus-storage/mousa-glass-staging-candleholders-480_bdd88b58.webp",
  "/manus-storage/mousa-glass-staging-serving-tray-960_a43d0762.webp": "/manus-storage/mousa-glass-staging-serving-tray-480_19cc5b9e.webp",
  "/manus-storage/mousa-glass-staging-amber-glassware-960_e4bd2db3.webp": "/manus-storage/mousa-glass-staging-amber-glassware-480_0fabe6c3.webp",
};

const stagedProductImage720: Record<string, string> = {
  "/manus-storage/mousa-glass-staging-amber-glassware-960_e4bd2db3.webp": "/manus-storage/mousa-glass-staging-amber-glassware-720_441c281f.webp",
};

const productCardSizes = "(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2.5rem), (max-width: 1279px) calc(33vw - 2.75rem), 300px";

/** Adds a smaller source only for the explicitly documented generated staging assets. */
export function responsiveStagingProductImage(url: string) {
  const normalizedUrl = url.split("?")[0];
  const smallerSource = stagedProductImage480[normalizedUrl];
  const mediumSource = stagedProductImage720[normalizedUrl];

  if (!smallerSource) return { src: url };

  return {
    src: url,
    srcSet: [
      `${smallerSource} 480w`,
      mediumSource ? `${mediumSource} 720w` : null,
      `${url} 960w`,
    ]
      .filter(Boolean)
      .join(", "),
    sizes: productCardSizes,
  };
}
