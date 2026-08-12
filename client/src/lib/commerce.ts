export function formatMoney(amount: number, currency = "EGP") {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function formatOrderDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function primaryImage(images: Array<{ url: string }> | undefined) {
  return images?.[0]?.url ?? "/manus-storage/glass-products-hero_79a48c05_fa45b861.jpg";
}

export function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}
