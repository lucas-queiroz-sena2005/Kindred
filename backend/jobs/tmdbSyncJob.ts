import cron from "node-cron";
import { TmdbSyncService } from "../services/jobs/tmdbSyncService.js";

const setupTmdbSyncJob = () => {
  // Run daily at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Starting daily TMDB synchronization...");
      await TmdbSyncService.updateConfiguration(); // Refresh image CDN paths
      await TmdbSyncService.syncChangedMedia(); // Refresh movie data
      console.log("Sync complete.");
    } catch (error) {
      console.error("Error during daily TMDB synchronization:", error);
    }
  });
};

export default setupTmdbSyncJob;
