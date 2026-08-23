import { describe, expect, it, vi } from "vitest";
import { attemptOwnerNotification, orderAlertPayload, paymentProofAlertPayload } from "./_core/operations";

describe("operational owner alerts", () => {
  it("uses an order reference and admin route without customer PII", () => {
    const payload = orderAlertPayload({ orderId: 12, orderNumber: "MG-20260823-12", paymentMethod: "cash_on_delivery" });
    expect(payload.content).toContain("MG-20260823-12");
    expect(payload.content).toContain("/admin/orders/12");
    expect(payload.content).not.toContain("@example");
  });

  it("creates a focused InstaPay-proof review alert", () => {
    expect(paymentProofAlertPayload({ orderId: 3, orderNumber: "MG-3" })).toMatchObject({ title: "تم رفع إثبات دفع InstaPay" });
  });

  it("contains a failed owner-notification delivery without throwing into the customer workflow", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await expect(attemptOwnerNotification({ title: "Test", content: "Test" }, async () => {
      throw new Error("notification unavailable");
    })).resolves.toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("customer workflow continued"));
    warn.mockRestore();
  });
});
