import { validateRegistrationInput } from "../../utils/authValidation.js";
import { ValidationError } from "../../errors/customErrors.js";
import { describe, it, expect } from "vitest";

describe("validateRegistrationInput", () => {
  it("accepts a valid registration payload", () => {
    const payload = {
      email: "john@example.com",
      username: "john_doe",
      password: "strong-password",
    };

    expect(() => validateRegistrationInput(payload)).not.toThrow();
  });

  it("rejects invalid email", () => {
    const payload = {
      email: "not-an-email",
      username: "john_doe",
      password: "strong-password",
    };

    expect(() => validateRegistrationInput(payload)).toThrow(ValidationError);
  });

  it("rejects invalid username", () => {
    const payload = {
      email: "john@example.com",
      username: "john#doe",
      password: "strong-password",
    };

    expect(() => validateRegistrationInput(payload)).toThrow(ValidationError);
  });
});
