import cron from "node-cron";
import { TmdbSyncService } from "../services/jobs/tmdbSyncService.js";

const JOB_NAME = "daily_tmdb_sync";

const setupTmdbSyncJob = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log(`[${JOB_NAME}] Cron heartbeat: checking if ready...`);
    try {
      const ready = await TmdbSyncService.canRunJob(JOB_NAME);
      if (!ready) return;

      console.log(`[${JOB_NAME}] Interval reached. Starting sync...`);
      await TmdbSyncService.setJobStatus(JOB_NAME, "running");

      await TmdbSyncService.updateConfiguration();
      await TmdbSyncService.syncChangedMedia();

      await TmdbSyncService.setJobStatus(JOB_NAME, "success", {
        message: "Sync complete",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`[${JOB_NAME}] Error:`, errorMessage);

      await TmdbSyncService.setJobStatus(JOB_NAME, "failed", {
        error: errorMessage,
      });
    }
  });
};

export default setupTmdbSyncJob;
