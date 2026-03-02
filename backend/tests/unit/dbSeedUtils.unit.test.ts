import { buildBulkInsertPlaceholders } from "../../db/seed/utils.js";
import { describe, it, expect } from "vitest";

describe("buildBulkInsertPlaceholders", () => {
  it("builds sequential placeholders for multiple rows", () => {
    const result = buildBulkInsertPlaceholders(2, 3);

    expect(result).toBe("($1, $2, $3), ($4, $5, $6)");
  });

  it("returns an empty string if rows is 0", () => {
    const result = buildBulkInsertPlaceholders(0, 3);

    expect(result).toBe("");
  });

  it("returns an empty parenthesis if columns is 0", () => {
    const result = buildBulkInsertPlaceholders(1, 0);

    expect(result).toBe("()");
  });
});
