import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { corsPolicy, createRateLimiter, isAllowedBrowserOrigin, requireTrustedMutationOrigin } from "./_core/security";

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
});
