import pool from "../db/db.js";
import { ApiError } from "../errors/customErrors.js";

interface RankedItemInput {
  movieId: number;
  tier: number;
}

/**
 * Fetches a list of all available tierlist templates with sorting and filtering.
 * @param userId - The ID of the currently authenticated user.
 * @param sortBy - The sorting criteria ('title' or 'createdAt').
 * @param filter - The filter criteria ('all', 'ranked', or 'unranked').
 */
export async function getAllTemplates(
  userId: number,
  sortBy: string = "title",
  filter: string = "all"
) {
  let orderByClause = "ORDER BY tt.title ASC";
  if (sortBy === "createdAt") {
    orderByClause = "ORDER BY tt.created_at DESC";
  }

  let whereClause = "";
  const queryParams: (number | string)[] = [userId];

  if (filter === "ranked") {
    whereClause = "WHERE ur.id IS NOT NULL";
  } else if (filter === "unranked") {
    whereClause = "WHERE ur.id IS NULL";
  }

  const query = `
    SELECT
        tt.id,
        tt.title,
        tt.description,
        CASE WHEN ur.id IS NOT NULL THEN true ELSE false END AS "isRanked"
    FROM
        tierlist_templates tt
    LEFT JOIN
        user_rankings ur ON tt.id = ur.template_id AND ur.user_id = $1
    ${whereClause}
    ${orderByClause}
  `;

  const { rows } = await pool.query(query, queryParams);
  return rows;
}

/**
 * Fetches a specific tierlist, returning user's ranking or the template.
 * This is more efficient as it uses a single, powerful query with conditional aggregation.
 * @param tierlistId - The ID of the tierlist template.
 * @param userId - The ID of the currently authenticated user.
 */
export async function getTierlistById(tierlistId: number, userId: number) {
  const query = `
    SELECT
        tt.id,
        tt.title,
        tt.description,
        ur.id IS NOT NULL AS "isRanked",
        -- Aggregate ranked items into a JSON array if a ranking exists
        CASE WHEN ur.id IS NOT NULL THEN
            (SELECT json_agg(json_build_object('movieId', ri.movie_id, 'tier', ri.tier, 'title', m.title, 'poster_path', m.poster_path))
             FROM ranked_items ri
             JOIN movies m ON ri.movie_id = m.id
             WHERE ri.ranking_id = ur.id)
        ELSE NULL END AS "rankedItems",
        -- Aggregate template movies into a JSON array if no ranking exists
        CASE WHEN ur.id IS NULL THEN
            (SELECT json_agg(json_build_object('id', m.id, 'title', m.title, 'poster_path', m.poster_path))
             FROM template_movies tm
             JOIN movies m ON tm.movie_id = m.id
             WHERE tm.template_id = tt.id)
        ELSE NULL END AS "movies"
    FROM
        tierlist_templates tt
    LEFT JOIN
        user_rankings ur ON tt.id = ur.template_id AND ur.user_id = $2
    WHERE
        tt.id = $1
    GROUP BY
        tt.id, ur.id;
  `;

  const { rows } = await pool.query(query, [tierlistId, userId]);

  if (rows.length === 0) {
    throw new ApiError("Tierlist template not found.", 404);
  }

  // The aggregated JSON might be null if no items exist, default to an empty array.
  const result = rows[0];
  if (result.isRanked) {
    result.rankedItems = result.rankedItems || [];
  } else {
    result.movies = result.movies || [];
  }

  return result;
}

/**
 * Saves or updates a user's ranking for a tierlist within a transaction.
 * @param userId - The ID of the user saving the ranking.
 * @param templateId - The ID of the tierlist template being ranked.
 * @param rankedItems - An array of objects with movieId and tier.
 */
export async function saveUserRanking(
  userId: number,
  templateId: number,
  rankedItems: RankedItemInput[]
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Upsert the user_ranking record and get its ID.
    const rankingResult = await client.query(
      `INSERT INTO user_rankings (user_id, template_id) VALUES ($1, $2)
       ON CONFLICT (user_id, template_id) DO UPDATE SET created_at = NOW()
       RETURNING id`,
      [userId, templateId]
    );
    const rankingId = rankingResult.rows[0].id;

    // Clear any previous items for this ranking to handle updates correctly.
    await client.query("DELETE FROM ranked_items WHERE ranking_id = $1", [
      rankingId,
    ]);

    // Insert all new ranked items.
    // This can be further optimized with a single multi-row INSERT statement.
    for (const item of rankedItems) {
      await client.query(
        "INSERT INTO ranked_items (ranking_id, movie_id, tier) VALUES ($1, $2, $3)",
        [rankingId, item.movieId, item.tier]
      );
    }

    await client.query("COMMIT");
    return { message: "Ranking saved successfully." };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error; // Re-throw to be caught by the controller's error handler
  } finally {
    client.release();
  }
}