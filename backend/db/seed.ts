import "dotenv/config";
import pool from "./db.js";
import { clearDatabase } from "./seed/clear.js";
import { seedNewData } from "./seed/seedNewData.js";

async function main() {
  if (!process.env.TMDB_API_KEY) {
    console.warn("TMDB_API_KEY is not defined in .env file, but it is not required for this seed script.");
  }

  try {
    await clearDatabase(await pool.connect());
    await seedNewData();
  } catch (err) {
    console.error("Error during database seeding:", err);
  } finally {
    await pool.end();
  }
}

main();
