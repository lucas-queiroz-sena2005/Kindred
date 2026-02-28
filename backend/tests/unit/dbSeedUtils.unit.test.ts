import { buildBulkInsertPlaceholders } from "../../db/seed/utils.js";
import { describe, it, expect } from "vitest";

describe("buildBulkInsertPlaceholders", () => {
  it("builds sequential placeholders for multiple rows", () => {
    const result = buildBulkInsertPlaceholders(2, 3);

    expect(result).toBe("($1, $2, $3), ($4, $5, $6)");
  });

  it("builds placeholders for a single row", () => {
    const result = buildBulkInsertPlaceholders(1, 2);

    expect(result).toBe("($1, $2)");
  });
});
