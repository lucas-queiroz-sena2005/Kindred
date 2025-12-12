import pool from "../db/db.js";
import {
  FEATURE_MAP,
  VECTOR_DIMENSION,
  k_DAMPENING_FACTOR,
  TIER_WEIGHTS,
} from "./featureMap.js";
import { ApiError } from "../errors/customErrors.js";
import { PoolClient } from "pg";

interface UserRankingFeature {
  tier: number;
  features: string[];
}

/**
 * Fetches all ranked movie features for a given user.
 * This query is optimized to use the pre-built `vw_movie_features` view,
 * avoiding costly lateral joins and making it much more performant.
 */
async function getAllUserRankings(
  client: PoolClient,
  userId: number
): Promise<UserRankingFeature[]> {
  const { rows } = await client.query<UserRankingFeature>(
    `--sql
    SELECT
      ri.tier,
      array_agg(DISTINCT f.feature_name) FILTER (WHERE f.feature_name IS NOT NULL) AS features
    FROM user_rankings ur
    JOIN ranked_items ri ON ur.id = ri.ranking_id
    JOIN (
      -- Unpivot features from the view for easier aggregation
      SELECT movie_id, genre_name AS feature_name FROM vw_movie_features
      UNION ALL
      SELECT movie_id, director_name AS feature_name FROM vw_movie_features
      UNION ALL
      SELECT movie_id, CAST(decade AS VARCHAR) AS feature_name FROM vw_movie_features
    ) AS f ON ri.movie_id = f.movie_id
    WHERE ur.user_id = $1
    GROUP BY ri.id, ri.tier;
    `,
    [userId]
  );
  return rows;
}

/**
 * Aggregates raw rankings into score and count vectors based on movie features.
 */
function aggregateFeatureScores(allRankings: UserRankingFeature[]): {
  total_score_vector: number[];
  feature_count_vector: number[];
} {
  const total_score_vector = new Array(VECTOR_DIMENSION).fill(0);
  const feature_count_vector = new Array(VECTOR_DIMENSION).fill(0);

  for (const ranking of allRankings) {
    const tierWeight =
      TIER_WEIGHTS[ranking.tier as keyof typeof TIER_WEIGHTS] ?? 0;

    for (const featureName of ranking.features) {
      const index = FEATURE_MAP[featureName as keyof typeof FEATURE_MAP];
      if (index !== undefined) {
        total_score_vector[index] += tierWeight;
        feature_count_vector[index] += 1;
      }
    }
  }
  return { total_score_vector, feature_count_vector };
}

/**
 * Calculates the final profile vector using a Bayesian average (dampened mean).
 * This prevents features with very few rankings from having an outsized impact.
 */
function calculateDampenedVector(
  total_score_vector: number[],
  feature_count_vector: number[]
): number[] {
  const new_profile_vector = new Array(VECTOR_DIMENSION).fill(0);
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    const count = feature_count_vector[i];
    if (count > 0) {
      const totalScore = total_score_vector[i];
      // The dampening factor ensures that scores from features with low counts
      // are "shrunk" towards zero, reducing noise.
      new_profile_vector[i] = totalScore / (k_DAMPENING_FACTOR + count);
    }
  }
  return new_profile_vector;
}

/**
 * Recalculates and updates a user's profile vector based on all their movie rankings.
 * This is an idempotent operation that rebuilds the vector from scratch.
 */
export async function recalculateProfileVector(userId: number) {
  console.log(
    `[VectorService] Starting vector recalculation for userId: ${userId}`
  );

  const client = await pool.connect();
  try {
    // 1. Fetch all user rankings and their associated features.
    const allRankings = await getAllUserRankings(client, userId);

    // 2. Aggregate scores and counts for each feature dimension.
    const { total_score_vector, feature_count_vector } =
      aggregateFeatureScores(allRankings);

    // 3. Calculate the final, dampened profile vector.
    const new_profile_vector = calculateDampenedVector(
      total_score_vector,
      feature_count_vector
    );

    // 4. Persist the new vector to the database.
    const vectorString = `[${new_profile_vector.join(",")}]`;
    const updateResult = await client.query(
      `--sql
      UPDATE users SET profile_vector = $1 WHERE id = $2`,
      [vectorString, userId]
    );

    // Add error handling for cases where the user ID might not exist.
    if (updateResult.rowCount === 0) {
      throw new ApiError(
        `User with ID ${userId} not found for vector update.`,
        404
      );
    }

    console.log(
      `[VectorService] Recalculation completed for userId: ${userId}`
    );
  } catch (error) {
    console.error(
      `🔴 [VectorService] Failed to recalculate vector for userId: ${userId}`,
      error
    );
    // Re-throw the error to be handled by the calling service if necessary.
    throw error;
  } finally {
    client.release();
  }
}