import pool from "../db/db.js";
import { ApiError } from "../errors/customErrors.js";
import { recalculateProfileVector } from './vectorService.js';

interface RankedItemInput {
  movieId: number;
  tier: number;
}

/**
 * Fetch all tierlist templates with optional sorting and filtering.
 */
export async function getAllTemplates(
  userId: number,
  sortBy: "title" | "createdAt",
  filter: "all" | "ranked" | "unranked",
  limit: number,
  offset: number
) {
  const sortColumn = sortBy === "createdAt" ? "ur.updated_at" : "tt.title";
  const sortDirection = sortBy === "createdAt" ? "DESC" : "ASC";

  const whereClause =
    filter === "ranked"
      ? "WHERE ur.id IS NOT NULL"
      : filter === "unranked"
      ? "WHERE ur.id IS NULL"
      : "";

  const query = `--sql
    SELECT
      tt.id,
      tt.title,
      tt.description,
      (ur.id IS NOT NULL) AS "isRanked",
      ur.updated_at AS "updatedAt"
    FROM tierlist_templates tt
    LEFT JOIN user_rankings ur
      ON tt.id = ur.template_id AND ur.user_id = $1
    ${whereClause}
    ORDER BY ${sortColumn} ${sortDirection} NULLS LAST
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await pool.query(query, [userId, limit, offset]);
  return rows;
}

/**
 * Fetch a single tierlist template and its movies, including user's ranking.
 */
export async function getTierlistById(tierlistId: number, userId: number) {
  const templateRes = await pool.query(
    `SELECT id, title, description FROM tierlist_templates WHERE id = $1`,
    [tierlistId]
  );
  if (!templateRes.rows.length)
    throw new ApiError("Tierlist template not found.", 404);

  const template = templateRes.rows[0];

  const moviesRes = await pool.query(
    `--sql
    SELECT
      m.id,
      m.title,
      m.poster_path,
      m.release_year,
      ri.tier
    FROM template_movies tm
    JOIN movies m ON tm.movie_id = m.id
    LEFT JOIN user_rankings ur
      ON ur.template_id = tm.template_id AND ur.user_id = $2
    LEFT JOIN ranked_items ri
      ON ri.ranking_id = ur.id AND ri.movie_id = m.id
    WHERE tm.template_id = $1
  `,
    [tierlistId, userId]
  );

  return {
    ...template,
    movies: moviesRes.rows,
    isRanked: moviesRes.rows.some((row) => row.tier !== null),
  };
}

/**
 * Save or update user's ranking for a tierlist.
 */
export async function saveUserRanking(
  userId: number,
  templateId: number,
  rankedItems: RankedItemInput[]
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verify that the template exists before proceeding
    const templateCheck = await client.query(
      `--sql SELECT id FROM tierlist_templates WHERE id = $1`,
      [templateId]
    );
    if (templateCheck.rows.length === 0) {
      throw new ApiError("Tierlist template not found.", 404);
    }

    const {
      rows: [ranking],
    } = await client.query(
      `--sql
      INSERT INTO user_rankings (user_id, template_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, template_id)
      DO UPDATE SET updated_at = NOW()
      RETURNING id
    `,
      [userId, templateId]
    );

    // Atomically delete old items and insert new ones
    await client.query(
      `--sql DELETE FROM ranked_items WHERE ranking_id = $1`,
      [ranking.id]
    );

    if (rankedItems.length) {
      const insertQuery = `--sql
        INSERT INTO ranked_items (ranking_id, movie_id, tier)
        SELECT $1, movie_id, tier
        FROM UNNEST($2::int[], $3::int[]) AS t(movie_id, tier)
      `;
      const movieIds = rankedItems.map((item) => item.movieId);
      const tiers = rankedItems.map((item) => item.tier);
      await client.query(insertQuery, [ranking.id, movieIds, tiers]);
    }

    await client.query("COMMIT");

    await recalculateProfileVector(userId);
    
    return { message: "Ranking saved successfully." };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}