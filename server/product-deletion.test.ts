import { describe, expect, it } from "vitest";
import { assertProductCanBeDeleted } from "./db";

describe("historical product deletion safeguard", () => {
  it("permits deletion only when no order item references the product", () => {
    expect(() => assertProductCanBeDeleted(0)).not.toThrow();
  });

  it("rejects deleting a product referenced by immutable order history and directs the administrator to archive it", () => {
    expect(() => assertProductCanBeDeleted(1)).toThrow(/cannot be deleted.*Archive the product/i);
  });
});

