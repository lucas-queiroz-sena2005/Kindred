import "dotenv/config";


const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error("🔴 FATAL ERROR: JWT_SECRET is not defined in the environment variables.");
  process.exit(1);
}

export const authConfig = {
  // Validation
  USERNAME_REGEX: /^[a-zA-Z0-9_-]{1,20}$/,
  USERNAME_REQUIREMENTS: 'Username must be 1–20 characters, using letters, numbers, _ or -.',

  // Security
  SALT_ROUNDS: 10,
  JWT_EXPIRY: '3d',
  COOKIE_MAX_AGE: 3 * 24 * 60 * 60 * 1000, // 3 DAYS
  
  JWT_SECRET: jwtSecret,
};