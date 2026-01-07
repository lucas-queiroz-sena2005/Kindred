import bcrypt from "bcryptjs";
import { Filter } from "bad-words";
import pool from "../db/db.js";
import { ConflictError, UnauthorizedError } from "../errors/customErrors.js";
import { validateRegistrationInput } from "../utils/authValidation.js";
import { authConfig } from "../config/authConfig.js";
import { RegisteredUser, UserData } from "../types/userTypes.js";

const filter = new Filter();

export async function register(userData: UserData): Promise<RegisteredUser> {
  // Sanitization
  const trimmedData = {
    ...userData,
    username: userData.username.trim(),
    email: userData.email.trim(),
  };
  validateRegistrationInput(trimmedData);

  // Verify if content is clean
  if (
    filter.isProfane(trimmedData.username) ||
    filter.isProfane(trimmedData.email)
  ) {
    throw new ConflictError("Username or email contains inappropriate words.");
  }

  // Verification if existing user
  const existingUser = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1 OR username = $2",
    [trimmedData.email, trimmedData.username],
  );

  if (existingUser.rows.length > 0) {
    throw new ConflictError("Email or username already in use.");
  }

  // Password encryptation
  const hashedPassword = await bcrypt.hash(
    trimmedData.password,
    authConfig.SALT_ROUNDS,
  );

  // User insertion
  const newUserResult = await pool.query<{ id: number }>(
    `--sql
    INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
    [trimmedData.username, trimmedData.email, hashedPassword],
  );

  const newUserId = newUserResult.rows[0].id;

  // Initialize profile vector
  const zeroVector = new Array(256).fill(0);
  const vectorString = `[${zeroVector.join(",")}]`;

  await pool.query(
    `--sql
    UPDATE users SET profile_vector = $1 WHERE id = $2`,
    [vectorString, newUserId],
  );

  return { id: newUserId, username: trimmedData.username };
}

export async function login(userData: UserData): Promise<RegisteredUser> {
  const { username, password } = userData;
  if (!username || !password) {
    throw new UnauthorizedError("Invalid credentials.");
  }

  const { rows: users } = await pool.query<{
    id: number;
    username: string;
    password_hash: string;
  }>(
    `--sql
    SELECT id, username, password_hash FROM users WHERE username = $1`,
    [username.trim()],
  );

  if (users.length === 0) {
    throw new UnauthorizedError("Invalid credentials.");
  }

  const user = users[0];

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid credentials.");
  }

  return { id: user.id, username: user.username };
}
