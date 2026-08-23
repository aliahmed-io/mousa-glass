import { notifyOwner } from "./notification";

export function orderAlertPayload(input: { orderId: number; orderNumber: string; paymentMethod: "cash_on_delivery" | "instapay" }) {
  return {
    title: "طلب جديد يحتاج المراجعة",
    content: `تم إنشاء الطلب ${input.orderNumber} (${input.paymentMethod === "instapay" ? "InstaPay" : "الدفع عند الاستلام"}). راجعه من لوحة الإدارة: /admin/orders/${input.orderId}`,
  };
}

export function paymentProofAlertPayload(input: { orderId: number; orderNumber: string }) {
  return {
    title: "تم رفع إثبات دفع InstaPay",
    content: `تم رفع إثبات دفع للطلب ${input.orderNumber}. راجعه من لوحة الإدارة: /admin/orders/${input.orderId}`,
  };
}

export async function attemptOwnerNotification(
  payload: { title: string; content: string },
  deliver: typeof notifyOwner = notifyOwner,
): Promise<boolean> {
  try {
    const delivered = await deliver(payload);
    if (!delivered) console.warn("[Operations] Owner notification was not delivered; customer workflow continued.");
    return delivered;
  } catch {
    console.warn("[Operations] Owner notification failed; customer workflow continued.");
    return false;
  }
}

export function notifyOwnerNonBlocking(payload: { title: string; content: string }) {
  if (process.env.NODE_ENV === "test") return;
  void attemptOwnerNotification(payload);
}
