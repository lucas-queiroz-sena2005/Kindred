import { Response, CookieOptions } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { authConfig } from "../config/authConfig.js";

const isProduction = authConfig.IS_PRODUCTION;
const jwtSecret = authConfig.JWT_SECRET;
const jwtExpiry = authConfig.JWT_EXPIRY ?? "1h";
const maxAge = authConfig.COOKIE_MAX_AGE;


export function createToken(id: number, jwtSecret: string): string {
  const payload: JwtPayload = { id };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiry as SignOptions["expiresIn"],
  });
}


export function setTokenCookie(res: Response, token: string): void {
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: maxAge,
  };
  res.cookie("token", token, cookieOptions);
}
