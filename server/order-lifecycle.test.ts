import { describe, expect, it } from "vitest";
import { canTransitionOrderStatus, canTransitionPaymentStatus, shouldRestoreStock } from "./db";

describe("order lifecycle transition policy", () => {
  it("allows only forward fulfilment steps or cancellation before shipment", () => {
    expect(canTransitionOrderStatus("pending", "confirmed")).toBe(true);
    expect(canTransitionOrderStatus("pending", "cancelled")).toBe(true);
    expect(canTransitionOrderStatus("confirmed", "shipped")).toBe(true);
    expect(canTransitionOrderStatus("confirmed", "cancelled")).toBe(true);
    expect(canTransitionOrderStatus("shipped", "delivered")).toBe(true);
  });

  it("rejects skipped, reversed, and terminal fulfilment transitions", () => {
    expect(canTransitionOrderStatus("pending", "delivered")).toBe(false);
    expect(canTransitionOrderStatus("shipped", "cancelled")).toBe(false);
    expect(canTransitionOrderStatus("delivered", "confirmed")).toBe(false);
    expect(canTransitionOrderStatus("cancelled", "pending")).toBe(false);
  });
});

describe("InstaPay lifecycle transition policy", () => {
  it("allows review, decision, and re-review only in the defined direction", () => {
    expect(canTransitionPaymentStatus("awaiting_proof", "under_review")).toBe(true);
    expect(canTransitionPaymentStatus("under_review", "verified")).toBe(true);
    expect(canTransitionPaymentStatus("under_review", "rejected")).toBe(true);
    expect(canTransitionPaymentStatus("rejected", "under_review")).toBe(true);
  });

  it("rejects payment transitions that bypass evidence review or alter terminal states", () => {
    expect(canTransitionPaymentStatus("awaiting_proof", "verified")).toBe(false);
    expect(canTransitionPaymentStatus("verified", "rejected")).toBe(false);
    expect(canTransitionPaymentStatus("not_required", "under_review")).toBe(false);
  });
});

describe("cancellation stock restoration", () => {
  it("allows stock restoration only for the first valid cancellation", () => {
    expect(shouldRestoreStock("pending", "cancelled", null)).toBe(true);
    expect(shouldRestoreStock("confirmed", "cancelled", null)).toBe(true);
  });

  it("does not restore stock twice or for an ineligible cancellation", () => {
    expect(shouldRestoreStock("cancelled", "cancelled", null)).toBe(false);
    expect(shouldRestoreStock("pending", "cancelled", new Date())).toBe(false);
    expect(shouldRestoreStock("shipped", "cancelled", null)).toBe(false);
    expect(shouldRestoreStock("pending", "confirmed", null)).toBe(false);
  });
});
