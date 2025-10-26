import pool from "../db/db.js";
import {
  FEATURE_MAP,
  VECTOR_DIMENSION,
  k_DAMPENING_FACTOR,
  TIER_WEIGHTS,
} from "./featureMap.js";

interface UserRankingFeature {
  tier: number;
  features: string[];
}

export async function recalculateProfileVector(userId: number) {
  console.log(`[VectorService] Starting vector recalculation for userId: ${userId}`);

  const { rows: allRankings } = await pool.query<UserRankingFeature>(
    `--sql
    SELECT
      ri.tier,
      f.features
    FROM user_rankings ur
    JOIN ranked_items ri
      ON ur.id = ri.ranking_id
    JOIN LATERAL (
      SELECT
        array_agg(DISTINCT feature_name) AS features
      FROM (
        SELECT g.name AS feature_name
        FROM movie_genres mg
        JOIN genres g ON mg.genre_id = g.id
        WHERE mg.movie_id = ri.movie_id
        UNION ALL
        SELECT d.name
        FROM movies m
        JOIN directors d ON m.director_id = d.id
        WHERE m.id = ri.movie_id
        UNION ALL
        SELECT CAST(m.decade AS VARCHAR)
        SELECT CAST(m.decade AS VARCHAR) || 's'
        FROM movies m
        WHERE m.id = ri.movie_id
      ) AS all_features
      WHERE feature_name IS NOT NULL
    ) AS f ON TRUE
    WHERE
      ur.user_id = $1;
    `,
    [userId]
  );

  const total_score_vector = new Array(VECTOR_DIMENSION).fill(0);
  const feature_count_vector = new Array(VECTOR_DIMENSION).fill(0);

  for (const ranking of allRankings) {
    const tierWeight = TIER_WEIGHTS[ranking.tier as keyof typeof TIER_WEIGHTS] ?? 0;

    for (const featureName of ranking.features) {
      const index = FEATURE_MAP[featureName as keyof typeof FEATURE_MAP];

      if (index !== undefined) {
        total_score_vector[index] += tierWeight;
        feature_count_vector[index] += 1;
      }
    }
  }
  const new_profile_vector = new Array(VECTOR_DIMENSION).fill(0);
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    const count = feature_count_vector[i];
    const totalScore = total_score_vector[i];

    if (count > 0) {
      new_profile_vector[i] = totalScore / (k_DAMPENING_FACTOR + count);
    }
  }

  const vectorString = `[${new_profile_vector.join(',')}]`;

  await pool.query(
    `--sql
    UPDATE users SET profile_vector = $1 WHERE id = $2`,
    [vectorString, userId]
  );

  console.log(`[VectorService] Recalculation completed for userId: ${userId}`);
}