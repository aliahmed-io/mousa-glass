import { describe, expect, it } from "vitest";
import { healthPayload } from "./_core/health";

describe("health endpoint payload", () => {
  it("returns a minimal stable probe contract without operational or customer data", () => {
    expect(healthPayload(new Date("2026-08-23T00:00:00.000Z"))).toEqual({
      status: "ok",
      service: "mousa-glass",
      timestamp: "2026-08-23T00:00:00.000Z",
    });
  });
});
