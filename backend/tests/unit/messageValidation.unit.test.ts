import { describe, it, expect } from "vitest";
import {
  validateRequest,
  validateGetListParams,
} from "../../controllers/messageController.js";

describe("validateRequest", () => {
  it("accepts targetId as a string (from params)", () => {
    const result = validateRequest(1, "10");
    expect(result).toEqual({ userId: 1, targetId: 10 });
  });

  it("accepts targetId as a number (from internal/body)", () => {
    const result = validateRequest(1, 10);
    expect(result).toEqual({ userId: 1, targetId: 10 });
  });

  it("throws 401 if userId is undefined", () => {
    expect(() => validateRequest(undefined, 10)).toThrow(
      /Authentication required/,
    );
  });

  it("throws 400 if targetId is a non-numeric string", () => {
    expect(() => validateRequest(1, "abc")).toThrow(/valid number/);
  });

  it("throws 400 if targetId is NaN", () => {
    expect(() => validateRequest(1, NaN)).toThrow(/valid number/);
  });

  it("throws 400 if userId and targetId match", () => {
    expect(() => validateRequest(5, 5)).toThrow(/action on self/);
  });
});

describe("validateGetListParams", () => {
  it("returns defaults when inputs are undefined", () => {
    const result = validateGetListParams(undefined, undefined);
    expect(result).toEqual({ limit: 50, offset: 0 });
  });

  it("accepts string limit and numeric offset", () => {
    const result = validateGetListParams("25", 10);
    expect(result).toEqual({ limit: 25, offset: 10 });
  });

  it("throws when limit is 0", () => {
    expect(() => validateGetListParams(0, 0)).toThrow(/between 1 and 100/);
  });

  it("throws when limit is 101", () => {
    expect(() => validateGetListParams("101", 0)).toThrow(/between 1 and 100/);
  });

  it("accepts limit at the boundary (100)", () => {
    const result = validateGetListParams(100, 0);
    expect(result.limit).toBe(100);
  });

  it("throws when offset is negative", () => {
    expect(() => validateGetListParams(50, -1)).toThrow(/non-negative/);
  });

  it("throws when offset is NaN string", () => {
    expect(() => validateGetListParams(50, "not-a-number")).toThrow(
      /non-negative/,
    );
  });
});
