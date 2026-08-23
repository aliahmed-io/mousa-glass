import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { attemptOwnerNotification, orderAlertPayload, paymentProofAlertPayload } from "./_core/operations";
import { logTrpcFailure, trpcFailureDiagnostic } from "./_core/diagnostics";

describe("operational owner alerts", () => {
  it("runs hosted validation for the non-default verified readiness snapshot branch pattern", () => {
    const workflow = fs.readFileSync(path.resolve(process.cwd(), ".github/workflows/ci.yml"), "utf8");

    expect(workflow).toContain("production-readiness-audit-plan");
    expect(workflow).toContain("'production-readiness-verified-*'");
  });

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

  it("records only a correlation ID, procedure path, and error classification for server failures", () => {
    const diagnostic = trpcFailureDiagnostic({
      requestId: "c8794c45-519b-45eb-b317-73daef2d5b43",
      path: "orders.create",
      code: "FORBIDDEN",
    });

    expect(diagnostic).toEqual({
      event: "trpc_failure",
      requestId: "c8794c45-519b-45eb-b317-73daef2d5b43",
      path: "orders.create",
      code: "FORBIDDEN",
    });
    expect(JSON.stringify(diagnostic)).not.toContain("customer");
  });

  it("falls back to safe diagnostic placeholders and emits structured log output", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(trpcFailureDiagnostic({ requestId: 1, path: null, code: undefined })).toEqual({
      event: "trpc_failure",
      requestId: "unavailable",
      path: "unknown",
      code: "UNKNOWN",
    });

    logTrpcFailure({ requestId: "probe-123", path: "health.probe", code: "INTERNAL_SERVER_ERROR" });
    expect(error).toHaveBeenCalledWith(
      "[server diagnostic]",
      expect.stringContaining('"requestId":"probe-123"'),
    );
    error.mockRestore();
  });
});
