import validator from 'validator';
import { ValidationError } from '../errors/customErrors.js';
import { authConfig } from '../config/authConfig.js';
import { UserRegistrationData } from '../types/userTypes.js';

export function validateRegistrationInput(data: Partial<UserRegistrationData>): asserts data is UserRegistrationData {
  const { email, username, password } = data;

  if (!email || !username || !password) {
    throw new ValidationError('All fields are required.');
  }

  if (!validator.isEmail(email)) {
    throw new ValidationError('Invalid email format.');
  }

  if (!authConfig.USERNAME_REGEX.test(username)) {
    throw new ValidationError(authConfig.USERNAME_REQUIREMENTS);
  }
}