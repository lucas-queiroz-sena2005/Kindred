import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService.js';
import { createToken, setTokenCookie } from '../utils/tokenUtils.js';
import { ApiError } from '../errors/customErrors.js';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) { // TODO: Move to server start.
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
}

export async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!jwtSecret) {
      throw new Error('Server is misconfigured: JWT_SECRET is missing.');
    }

    // Call for registration
    const registeredUser = await authService.register(req.body);

    // Token creation and set
    const token = createToken(registeredUser.id, jwtSecret);
    setTokenCookie(res, token);

    res.status(201).json({ username: registeredUser.username });

  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    
    // Passing errors to global handler
    next(err);
  }
}