import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "net";

const authMocks = vi.hoisted(() => ({ authenticateRequest: vi.fn() }));
const dbMocks = vi.hoisted(() => ({ getPaymentProofAccessByStorageKey: vi.fn() }));

vi.mock("./_core/sdk", () => ({ sdk: authMocks }));
vi.mock("./db", () => dbMocks);
vi.mock("./_core/env", () => ({ ENV: { forgeApiUrl: "", forgeApiKey: "" } }));

import { registerStorageProxy } from "./_core/storageProxy";

async function requestProof(key = "payment-proofs/MG-100/proof.png") {
  const app = express();
  registerStorageProxy(app);
  const server = await new Promise<ReturnType<typeof app.listen>>(resolve => {
    const listener = app.listen(0, () => resolve(listener));
  });
  const port = (server.address() as AddressInfo).port;
  try {
    return await fetch(`http://127.0.0.1:${port}/manus-storage/${key}`, { redirect: "manual" });
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

describe("protected storage proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects an unauthenticated request for an InstaPay proof before contacting storage", async () => {
    authMocks.authenticateRequest.mockRejectedValue(new Error("No session"));

    const response = await requestProof();

    expect(response.status).toBe(401);
    expect(dbMocks.getPaymentProofAccessByStorageKey).not.toHaveBeenCalled();
  });

  it("rejects a customer who does not own the proof", async () => {
    authMocks.authenticateRequest.mockResolvedValue({ id: 22, role: "user" });
    dbMocks.getPaymentProofAccessByStorageKey.mockResolvedValue({ orderUserId: 99 });

    const response = await requestProof();

    expect(response.status).toBe(403);
    expect(dbMocks.getPaymentProofAccessByStorageKey).toHaveBeenCalledWith("payment-proofs/MG-100/proof.png");
  });

  it("permits the order owner to reach the configured storage path", async () => {
    authMocks.authenticateRequest.mockResolvedValue({ id: 22, role: "user" });
    dbMocks.getPaymentProofAccessByStorageKey.mockResolvedValue({ orderUserId: 22 });

    const response = await requestProof();

    expect(response.status).toBe(500);
  });

  it("permits an administrator to reach the configured storage path", async () => {
    authMocks.authenticateRequest.mockResolvedValue({ id: 1, role: "admin" });

    const response = await requestProof();

    expect(response.status).toBe(500);
    expect(dbMocks.getPaymentProofAccessByStorageKey).not.toHaveBeenCalled();
  });
});
