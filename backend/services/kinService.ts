import pool from "../db/db.js";
import { ApiError } from "../errors/customErrors.js";
import { FEATURE_CONFIG, FEATURE_NAMES, FeatureName } from "./featureMap.js";

export interface KinCompareResult {
  overallScore: number;
  segments: Record<FeatureName, number>;
}

export async function getKinListbyId(
  userId: number,
  filter: string,
  sortBy: FeatureName | "overall",
  limit: number,
  offset: number,
) {
  const connectOnly = filter === "connected";
  const unconnectedOnly = filter === "unconnected";

  const sliceString = sortBy === "overall" ? "" : FEATURE_CONFIG[sortBy].slice;

  const sortColumn =
    sortBy === "overall"
      ? `GREATEST(0, (1 - (other.profile_vector <=> tu.profile_vector)))`
      : `GREATEST(0, (1 - ( ((other.profile_vector::real[])${sliceString})::vector <=> ((tu.profile_vector::real[])${sliceString})::vector )))`;

  const query = `--sql
    WITH TargetUser AS (
        SELECT profile_vector FROM users WHERE id = $1
    )
    SELECT
      other.id,
      other.username,
      ${sortColumn} AS "similarityScore"
    FROM users AS other
    JOIN TargetUser AS tu ON true    
    LEFT JOIN user_connections uc ON
      (uc.user_id_a = $1 AND uc.user_id_b = other.id)
      OR (uc.user_id_b = $1 AND uc.user_id_a = other.id)      
    WHERE
      other.id != $1
      AND other.profile_vector IS NOT NULL
        
      ${connectOnly ? "AND uc.user_id_a IS NOT NULL" : ""}
      ${unconnectedOnly ? "AND uc.user_id_a IS NULL" : ""}
      
    ORDER BY
        "similarityScore" DESC
    
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await pool.query(query, [userId, limit, offset]);
  return rows;
}

export async function compareKin(
  userIdA: number,
  userIdB: number,
): Promise<KinCompareResult> {
  const segmentScoreQueries = Object.entries(FEATURE_CONFIG)
    .map(
      ([name, config]) =>
        `GREATEST(0, (1 - ( ((u1.profile_vector::real[])${config.slice})::vector <=> ((u2.profile_vector::real[])${config.slice})::vector ))) AS "${name}Score"`,
    )
    .join(",\n");

  const query = `--sql
    SELECT
      -- 1. Overall Score (Total Taste DNA)
      GREATEST(0, (1 - (u1.profile_vector <=> u2.profile_vector))) AS "overallScore",
      ${segmentScoreQueries}

    FROM users AS u1, users AS u2
    WHERE
      u1.id = $1 -- User A (e.g., the current user)
      AND u2.id = $2 -- User B (the user being compared against)
      AND u1.profile_vector IS NOT NULL
      AND u2.profile_vector IS NOT NULL
  `;

  type QueryResult = Record<`${FeatureName}Score`, number> & {
    overallScore: number;
  };

  const { rows } = await pool.query<QueryResult>(query, [userIdA, userIdB]);

  if (rows.length === 0) {
    throw new ApiError(
      "One or both users not found or have no profile vector.",
      404,
    );
  }

  const result = rows[0];

  const segments = FEATURE_NAMES.reduce(
    (acc, name) => {
      acc[name] = result[`${name}Score`];
      return acc;
    },
    {} as Record<FeatureName, number>,
  );

  return {
    overallScore: result.overallScore,
    segments,
  };
}
