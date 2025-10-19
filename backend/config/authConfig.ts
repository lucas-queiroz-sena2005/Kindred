import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiry = process.env.JWT_EXPIRY;
const nodeEnv = process.env.NODE_ENV;

if (!jwtSecret) {
  console.error("🔴 FATAL ERROR: JWT_SECRET is not defined in the environment variables.");
  process.exit(1);
}

type AuthConfig = {
  USERNAME_REGEX: RegExp;
  USERNAME_REQUIREMENTS: string;
  SALT_ROUNDS: number;
  JWT_EXPIRY: string;
  COOKIE_MAX_AGE: number;
  JWT_SECRET: string;
  IS_PRODUCTION: boolean;
};

export const authConfig: AuthConfig = {
  // Validation
  USERNAME_REGEX: /^[a-zA-Z0-9_-]{1,20}$/,
  USERNAME_REQUIREMENTS: "Username must be 1–20 characters, using letters, numbers, _ or -.",

  // Security
  SALT_ROUNDS: 10,
  JWT_EXPIRY: jwtExpiry ?? "1h",
  COOKIE_MAX_AGE: 3 * 24 * 60 * 60 * 1000,
  JWT_SECRET: jwtSecret,
  IS_PRODUCTION: nodeEnv === "production",
};
