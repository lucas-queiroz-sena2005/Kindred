import "dotenv/config";
import pool from "./db.js";

async function cleanUserData() {
  const client = await pool.connect();
  try {
    console.log("--- Cleaning user & social data (keeping movie catalog & templates) ---");
    await client.query("BEGIN");
    await client.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
    await client.query("COMMIT");
    console.log("✅ User data cleared. Templates and movies are unchanged.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("🔴 db:clean failed:", err);
    process.exitCode = 1;
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

cleanUserData();
