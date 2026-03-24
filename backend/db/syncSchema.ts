import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { PoolClient } from "pg";

const sqlPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "database.sql",
);

export async function syncSchema(client: PoolClient): Promise<void> {
  try {
    const { rows } = await client.query<{ count: string }>(`
      SELECT count(*)::text AS count FROM information_schema.tables
      WHERE table_schema = 'public';
    `);
    const count = parseInt(rows[0].count, 10);

    if (count < 16) {
      console.log("[DB] Schema incomplete. Initializing...");
      await client.query(fs.readFileSync(sqlPath, "utf8"));
      console.log("[DB] Schema initialized.");
    } else {
      console.log("[DB] Schema verified.");
    }
  } catch (err) {
    console.error("[DB] Schema sync failed:", err);
    throw err;
  }
}
