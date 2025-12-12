import { Pool } from "pg";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.error(
    "🔴 FATAL ERROR: DATABASE_URL is not defined in the environment variables."
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
