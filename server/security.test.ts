import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { corsPolicy, createRateLimiter, createSharedRateLimiter, hashRateLimitClientKey, isAllowedBrowserOrigin, requestClientKey, requestCorrelation, requireTrustedMutationOrigin } from "./_core/security";

function request(overrides: Partial<Request> = {}) {
  return {
    method: "POST",
    ip: "203.0.113.10",
    protocol: "https",
    socket: { remoteAddress: "203.0.113.10" },
    header: (name: string) => ({ origin: "https://mousaglass.example", host: "mousaglass.example" }[name.toLowerCase()]),
    ...overrides,
  } as Request;
}

function response() {
  const res = {
    locals: {},
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
    end: vi.fn(),
  } as unknown as Response;
  vi.mocked(res.status).mockReturnValue(res);
  return res;
}

describe("request security controls", () => {
  it("accepts only same-origin or explicitly trusted browser origins", () => {
    expect(isAllowedBrowserOrigin("https://mousaglass.example", "mousaglass.example", "https")).toBe(true);
    expect(isAllowedBrowserOrigin("https://attacker.example", "mousaglass.example", "https")).toBe(false);
    expect(isAllowedBrowserOrigin("https://admin.example", "mousaglass.example", "https", ["https://admin.example"])).toBe(true);
  });

  it("attaches a safe request correlation identifier and ignores unsafe reflected values", () => {
    const middleware = requestCorrelation();
    const supplied = response();
    const generated = response();
    const next = vi.fn();

    middleware(request({ header: name => ({ "x-request-id": "release_20260823" }[name.toLowerCase()]) }), supplied, next);
    middleware(request({ header: name => ({ "x-request-id": "<unsafe value>" }[name.toLowerCase()]) }), generated, next);

    expect(supplied.setHeader).toHaveBeenCalledWith("X-Request-Id", "release_20260823");
    expect(generated.setHeader).toHaveBeenCalledWith("X-Request-Id", expect.stringMatching(/^[0-9a-f-]{36}$/));
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("rejects cross-site tRPC mutations before router execution", () => {
    const middleware = requireTrustedMutationOrigin();
    const res = response();
    const next = vi.fn();
    middleware(request({ header: name => ({ origin: "https://attacker.example", host: "mousaglass.example" }[name.toLowerCase()]) }), res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("answers approved preflight requests and rejects untrusted cross-origin preflight", () => {
    const middleware = corsPolicy();
    const allowed = response();
    const rejected = response();
    const next = vi.fn();
    middleware(request({ method: "OPTIONS" }), allowed, next);
    expect(allowed.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", "https://mousaglass.example");
    expect(allowed.status).toHaveBeenCalledWith(204);
    expect(allowed.end).toHaveBeenCalled();
    middleware(request({ method: "OPTIONS", header: name => ({ origin: "https://attacker.example", host: "mousaglass.example" }[name.toLowerCase()]) }), rejected, next);
    expect(rejected.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("limits repeated requests by client and route", () => {
    const middleware = createRateLimiter({ name: "test", windowMs: 60_000, max: 2 });
    const first = response();
    const second = response();
    const third = response();
    const next = vi.fn();
    middleware(request(), first, next);
    middleware(request(), second, next);
    middleware(request(), third, next);
    expect(next).toHaveBeenCalledTimes(2);
    expect(third.status).toHaveBeenCalledWith(429);
  });

  it("uses a shared hashed bucket for high-risk mutations across instances", async () => {
    const consume = vi.fn()
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 9 });
    const middleware = createSharedRateLimiter({ name: "checkout", windowMs: 60_000, max: 8, keySecret: "test-secret", consume });
    const allowed = response();
    const blocked = response();
    const next = vi.fn();

    await middleware(request(), allowed, next);
    await middleware(request(), blocked, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(consume).toHaveBeenCalledTimes(2);
    expect(consume).toHaveBeenCalledWith(expect.objectContaining({
      scope: "checkout",
      keyHash: hashRateLimitClientKey("203.0.113.10", "test-secret"),
    }));
    expect(JSON.stringify(consume.mock.calls)).not.toContain("203.0.113.10");
    expect(blocked.status).toHaveBeenCalledWith(429);
  });

  it("uses Express proxy-normalized client identity instead of direct forwarded-header text", () => {
    const req = request({
      ip: "198.51.100.24",
      header: name => ({
        "x-forwarded-for": "attacker-controlled, 203.0.113.10",
      }[name.toLowerCase()]),
    });

    expect(requestClientKey(req)).toBe("198.51.100.24");
    expect(hashRateLimitClientKey(requestClientKey(req), "test-secret"))
      .toBe(hashRateLimitClientKey("198.51.100.24", "test-secret"));
  });

  it("fails closed for high-risk mutations when shared limiter storage is unavailable", async () => {
    const middleware = createSharedRateLimiter({
      name: "proof-upload",
      windowMs: 60_000,
      max: 12,
      keySecret: "test-secret",
      consume: vi.fn().mockRejectedValue(new Error("database unavailable")),
    });
    const res = response();
    const next = vi.fn();

    await middleware(request(), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
  });
});
