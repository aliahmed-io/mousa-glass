export function formatMoney(amount: number, currency = "EGP") {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function formatOrderDate(value: Date | string) {
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function primaryImage(images: Array<{ url: string }> | undefined) {
  return images?.[0]?.url ?? "/manus-storage/glass-products-hero_79a48c05_ae72e62e.jpg";
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "قيد المراجعة",
    confirmed: "تم التأكيد",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
    pending_review: "قيد المراجعة",
    awaiting_proof: "بانتظار إثبات التحويل",
    under_review: "تحت المراجعة",
    not_required: "غير مطلوب",
    verified: "تم التحقق",
    rejected: "مرفوض",
    unpaid: "غير مدفوع",
  };
  return labels[status] ?? status;
}
