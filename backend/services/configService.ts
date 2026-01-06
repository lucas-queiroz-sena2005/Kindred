import pool from '../db/db.js';
import { ApiError } from '../errors/customErrors.js';

export async function getTmdbConfig() {
  const { rows } = await pool.query('SELECT base_url, secure_base_url, poster_sizes FROM tmdb_config WHERE id = 1');
  if (rows.length === 0) {
    throw new ApiError('TMDB configuration not found in database. The synchronization job may not have run yet.', 503);
  }
  return rows[0];
}
