import { Response, CookieOptions } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { authConfig } from "../config/authConfig.js";

const isProduction = authConfig.IS_PRODUCTION;
const jwtSecret = authConfig.JWT_SECRET;
const jwtExpiry = authConfig.JWT_EXPIRY ?? "1h";
const maxAge = authConfig.COOKIE_MAX_AGE;

/**
 * SameSite=None requires Secure. In dev (HTTP + localhost), that combination is
 * rejected by browsers, so the session cookie was never stored and /user/me failed.
 *
 * Use CROSS_SITE_COOKIES=true when the SPA and API are on different sites
 * (e.g. Vercel app + separate API origin); then SameSite=None; Secure is required.
 */
function sessionCookieOptions(maxAgeMs?: number): CookieOptions {
  const crossSite = process.env.CROSS_SITE_COOKIES === "true";
  if (crossSite) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      ...(maxAgeMs !== undefined ? { maxAge: maxAgeMs } : {}),
    };
  }
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    ...(maxAgeMs !== undefined ? { maxAge: maxAgeMs } : {}),
  };
}

export function createToken(id: number, jwtSecret: string): string {
  const payload: JwtPayload = { id };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiry as SignOptions["expiresIn"],
  });
}

export function setTokenCookie(res: Response, token: string): void {
  res.cookie("token", token, sessionCookieOptions(maxAge));
}

export function clearTokenCookie(res: Response): void {
  res.clearCookie("token", sessionCookieOptions());
}
