import type { Express } from "express";
import pool from "../db/db.js";
import { syncSchema } from "../db/syncSchema.js";
import { startJobs } from "../jobs/index.js";
import { TmdbSyncService } from "../services/jobs/tmdbSyncService.js";

export async function startServer(app: Express): Promise<void> {
  const port = Number(process.env.PORT || 3001);
  let client;
  try {
    const t0 = Date.now();
    client = await pool.connect();
    await syncSchema(client);
    console.log(`[DB] Connected & synced (${Date.now() - t0}ms)`);

    await TmdbSyncService.updateConfiguration().catch(() =>
      console.warn("[TMDB] Config sync failed, using cache."),
    );

    startJobs();

    app.listen(port, "0.0.0.0", () => {
      console.log(
        `[SERVER] Listening on ${port} (NODE_ENV=${process.env.NODE_ENV ?? "undefined"})`,
      );
    });
  } catch (err) {
    console.error("[FATAL] Startup failed:", err);
    process.exit(1);
  } finally {
    client?.release();
  }
}
