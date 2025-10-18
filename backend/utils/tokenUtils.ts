import { Response, CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig.js';

const isProduction = process.env.NODE_ENV === 'production';

export function createToken(id: number, jwtSecret: string): string {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: authConfig.JWT_EXPIRY,
  });
}

export function setTokenCookie(res: Response, token: string): void {
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: authConfig.COOKIE_MAX_AGE,
  };
  res.cookie('token', token, cookieOptions);
}