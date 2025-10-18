import bcrypt from 'bcryptjs';
import pool from '../db/db.js';
import { ConflictError } from '../errors/customErrors.js';
import { validateRegistrationInput } from '../utils/authValidation.js';
import { authConfig } from '../config/authConfig.js';
import { UserRegistrationData } from '../types/userTypes.js';

interface RegisteredUser {
  id: number;
  username: string;
}

export async function register(userData: UserRegistrationData): Promise<RegisteredUser> {
  
  // Sanitization
  const trimmedData = {
    ...userData,
    name: userData.name.trim(),
    email: userData.email.trim(),
    username: userData.username.trim(),
  };
  validateRegistrationInput(trimmedData);

    // Verification if existing user
  const existingUser = await pool.query<{ id: number }>(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [trimmedData.email, trimmedData.username]
  );

  if (existingUser.rows.length > 0) {
    throw new ConflictError('Email or username already in use.');
  }

  // Password encryptation
  const hashedPassword = await bcrypt.hash(trimmedData.password, authConfig.SALT_ROUNDS);

  // User insertion
  const newUserResult = await pool.query<{ id: number }>(
    'INSERT INTO users (name, email, username, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
    [trimmedData.name, trimmedData.email, trimmedData.username, hashedPassword]
  );

  const newUserId = newUserResult.rows[0].id;

  return { id: newUserId, username: trimmedData.username };
}