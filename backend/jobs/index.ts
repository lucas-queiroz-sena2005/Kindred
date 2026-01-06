import setupTmdbSyncJob from "./tmdbSyncJob.js";

export const startJobs = () => {
  setupTmdbSyncJob();
  console.log("📝 Cron jobs started.");
};
