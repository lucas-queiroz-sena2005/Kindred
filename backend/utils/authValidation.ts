import validator from "validator";
import { ValidationError } from "../errors/customErrors.js";
import { authConfig } from "../config/authConfig.js";
import type { UserData } from "../types/userTypes.js";

const usernameRequirements = authConfig.USERNAME_REQUIREMENTS;


export function validateRegistrationInput(
  data: Partial<UserData>
): asserts data is UserData {
  const { email, username, password } = data;

  if (!email || !username || !password) {
    throw new ValidationError("All fields are required.");
  }

  if (!validator.isEmail(email)) {
    throw new ValidationError("Invalid email format.");
  }

  if (!authConfig.USERNAME_REGEX.test(username)) {
    throw new ValidationError(usernameRequirements);
  }
}
