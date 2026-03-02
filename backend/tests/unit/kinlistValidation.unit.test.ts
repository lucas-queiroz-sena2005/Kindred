import { describe, it, expect, vi } from "vitest";
import { validateGetKinListQueryParams } from "../../controllers/kinController.js"; // Adjust path
import { ApiError } from "../../errors/customErrors.js";

describe("validateGetKinListQueryParams", () => {
  it("returns default values when query is empty", () => {
    const result = validateGetKinListQueryParams({});

    expect(result).toEqual({
      filter: "all",
      sortBy: "overall",
      limit: 50,
      offset: 0,
    });
  });

  it("validates and parses correct parameters", () => {
    const query = {
      filter: "connected",
      sortBy: "overall",
      limit: "20",
      offset: "10",
    };
    const result = validateGetKinListQueryParams(query);

    expect(result).toEqual({
      filter: "connected",
      sortBy: "overall",
      limit: 20,
      offset: 10,
    });
  });

  it("throws ApiError (400) for unknown query parameters", () => {
    const query = { unknownParam: "malicious" };

    expect(() => validateGetKinListQueryParams(query)).toThrow(ApiError);
  });

  it("throws for invalid filter values", () => {
    const query = { filter: "not-a-real-filter" };
    expect(() => validateGetKinListQueryParams(query)).toThrow(
      /Invalid filter/,
    );
  });

  it("throws for invalid sortBy values", () => {
    const query = { sortBy: "invalid-field" };
    expect(() => validateGetKinListQueryParams(query)).toThrow(
      /Invalid sortBy/,
    );
  });

  describe("limit parameter", () => {
    it("throws when limit is below 1", () => {
      expect(() => validateGetKinListQueryParams({ limit: "0" })).toThrow();
    });

    it("throws when limit is above 100", () => {
      expect(() => validateGetKinListQueryParams({ limit: "101" })).toThrow();
    });

    it("throws when limit is not a number", () => {
      expect(() => validateGetKinListQueryParams({ limit: "abc" })).toThrow();
    });
  });

  describe("offset parameter", () => {
    it("throws when offset is negative", () => {
      expect(() => validateGetKinListQueryParams({ offset: "-1" })).toThrow();
    });

    it("accepts 0 as a valid offset", () => {
      const result = validateGetKinListQueryParams({ offset: "0" });
      expect(result.offset).toBe(0);
    });

    it("throws when offset is not a number", () => {
      expect(() => validateGetKinListQueryParams({ offset: "abc" })).toThrow();
    });
  });
});
