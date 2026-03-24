import rateLimit from "express-rate-limit";

function limiter(windowMs: number, max: number, message: string) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Rate Limit Exceeded", message },
  });
}

export const globalLimiter = limiter(
  15 * 60 * 1000,
  1000,
  "Global limit exceeded.",
);

export const authRouteLimiter = limiter(
  60 * 60 * 1000,
  100,
  "Too many login attempts.",
);
