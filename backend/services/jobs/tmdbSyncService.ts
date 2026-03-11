import axios from "axios";
import type { AxiosResponse } from "axios";
import pool from "../../db/db.js";
import { QueryResult } from "pg";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const SYNC_INTERVAL = parseInt(process.env.SYNC_INTERVAL_MINUTES || "1440", 10);

interface TmdbConfiguration {
  images: {
    base_url: string;
    secure_base_url: string;
    poster_sizes: string[];
  };
}

interface TmdbChangeResult {
  id: number;
}

interface TmdbChangesResponse {
  results: TmdbChangeResult[];
}

interface TmdbMovieDetails {
  title: string;
  poster_path: string;
}
type JobStatus = "success" | "running" | "failed";

export const TmdbSyncService = {
  /**
   * Updates the base_url and sizes required for image building.
   * Should be called at least once every few days.
   */
  async updateConfiguration(): Promise<void> {
    const response: AxiosResponse<TmdbConfiguration> = await axios.get(
      `${TMDB_BASE}/configuration`,
      {
        params: { api_key: TMDB_API_KEY },
      },
    );
    const { base_url, secure_base_url, poster_sizes } = response.data.images;

    await pool.query(
      `INSERT INTO tmdb_config (id, base_url, secure_base_url, poster_sizes, updated_at)
             VALUES (1, $1, $2, $3, NOW())
             ON CONFLICT (id) DO UPDATE SET 
             base_url = EXCLUDED.base_url, 
             secure_base_url = EXCLUDED.secure_base_url,
             poster_sizes = EXCLUDED.poster_sizes, 
             updated_at = NOW()`,
      [base_url, secure_base_url, poster_sizes],
    );
  },

  async syncChangedMedia(): Promise<void> {
    const localRes: QueryResult<{ tmdb_id: number }> = await pool.query(
      `SELECT tmdb_id FROM movies WHERE tmdb_id IS NOT NULL`,
    );
    const localIds = new Set(localRes.rows.map((r) => r.tmdb_id));

    const tmdbRes: AxiosResponse<TmdbChangesResponse> = await axios.get(
      `${TMDB_BASE}/movie/changes`,
      {
        params: { api_key: TMDB_API_KEY },
      },
    );

    const changedIds = tmdbRes.data.results
      .map((r: TmdbChangeResult) => r.id)
      .filter((id: number) => localIds.has(id));

    // Background update for modified items
    for (const id of changedIds) {
      const detail: AxiosResponse<TmdbMovieDetails> = await axios.get(
        `${TMDB_BASE}/movie/${id}`,
        {
          params: { api_key: TMDB_API_KEY },
        },
      );

      await pool.query(
        `UPDATE movies SET 
                    title = $1, 
                    poster_path = $2, 
                    last_sync = NOW() 
                 WHERE tmdb_id = $3`,
        [detail.data.title, detail.data.poster_path, id],
      );
    }
  },

  async canRunJob(jobName: string): Promise<boolean> {
    const res = await pool.query<{ last_run_at: Date; type: JobStatus }>(
      `SELECT last_run_at, type FROM job_sync_log WHERE job_name = $1`,
      [jobName],
    );

    if (res.rows.length === 0) return true;

    const { last_run_at, type } = res.rows[0];

    if (type === "running") return false;

    const lastRun = new Date(last_run_at);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastRun.getTime()) / (1000 * 60);

    return diffInMinutes >= SYNC_INTERVAL;
  },

  async setJobStatus(
    jobName: string,
    status: JobStatus,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await pool.query(
      `INSERT INTO job_sync_log (job_name, last_run_at, type, metadata)
       VALUES ($1, NOW(), $2, $3)
       ON CONFLICT (job_name) DO UPDATE SET 
       type = EXCLUDED.type, 
       last_run_at = NOW(),
       metadata = EXCLUDED.metadata`,
      [jobName, status, JSON.stringify(metadata)],
    );
  },
};
