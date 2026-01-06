import axios, { AxiosResponse } from "axios";
import pool from "../../db/db.js";
import { QueryResult } from "pg";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

// Type definitions for TMDB API responses
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

  /**
   * The 24-hour Sync Logic:
   * 1. Check which IDs changed on TMDB in the last 24h.
   * 2. Compare against our local tmdb_id database.
   * 3. Update only the relevant records.
   */
  async syncChangedMedia(): Promise<void> {
    // Get list of local IDs
    const localRes: QueryResult<{ tmdb_id: number }> = await pool.query(
      `SELECT tmdb_id FROM movies WHERE tmdb_id IS NOT NULL`,
    );
    const localIds = new Set(localRes.rows.map((r) => r.tmdb_id));

    // Get TMDB changes from last 24h
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
};
