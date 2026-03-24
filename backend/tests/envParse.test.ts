import { describe, it, expect } from "vitest";
import { envIsTruthy, parseCorsOrigins } from "../utils/envParse.js";

describe("envIsTruthy", () => {
  it("accepts common truthy spellings", () => {
    expect(envIsTruthy("true")).toBe(true);
    expect(envIsTruthy("TRUE")).toBe(true);
    expect(envIsTruthy(" True ")).toBe(true);
    expect(envIsTruthy("1")).toBe(true);
    expect(envIsTruthy("yes")).toBe(true);
  });

  it("rejects non-truthy", () => {
    expect(envIsTruthy(undefined)).toBe(false);
    expect(envIsTruthy("false")).toBe(false);
    expect(envIsTruthy("")).toBe(false);
  });
});

describe("parseCorsOrigins", () => {
  it("splits comma-separated values and strips trailing slashes", () => {
    expect(parseCorsOrigins("https://a.com/, https://b.com", "x")).toEqual([
      "https://a.com",
      "https://b.com",
    ]);
  });
});
