import { describe, expect, it } from "vitest";
import { healthPayload, registerHealthRoutes } from "./_core/health";

describe("health endpoint payload", () => {
  it("returns a minimal stable probe contract without operational or customer data", () => {
    expect(healthPayload(new Date("2026-08-23T00:00:00.000Z"))).toEqual({
      status: "ok",
      service: "mousa-glass",
      timestamp: "2026-08-23T00:00:00.000Z",
    });
  });

  it("registers both the internal health path and the managed-edge-compatible public alias", () => {
    const routes = new Map<string, Function>();
    registerHealthRoutes({
      get: (path, handler) => {
        routes.set(path, handler);
      },
    });

    expect([...routes.keys()]).toEqual(["/healthz", "/api/healthz"]);

    for (const handler of routes.values()) {
      let statusCode: number | undefined;
      let payload: unknown;
      const response = {
        status: (code: number) => {
          statusCode = code;
          return response;
        },
        json: (body: unknown) => {
          payload = body;
          return response;
        },
      };
      handler({}, response, () => undefined);
      expect(statusCode).toBe(200);
      expect(payload).toMatchObject({ status: "ok", service: "mousa-glass" });
    }
  });
});
