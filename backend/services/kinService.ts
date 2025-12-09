import pool from "../db/db.js";
import { ApiError } from "../errors/customErrors.js";
import { GENRE_SLICE, DECADE_SLICE, DIRECTOR_SLICE } from "./featureMap.js";

export interface KinCompareResult {
  overallScore: number;
  segments: {
    genre: number;
    decade: number;
    director: number;
  };
}

export async function getKinListbyId(
  userId: number,
  filter: string,
  limit: number,
  offset: number
) {
  const connectOnly = filter === "connected";
  const unconnectedOnly = filter === "unconnected";

  const query = `--sql
    WITH TargetUser AS (
        SELECT profile_vector FROM users WHERE id = $1
    )
    SELECT
      other.id,
      other.username,
      (1 - (other.profile_vector <=> tu.profile_vector)) AS similarity_score
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
        similarity_score DESC
    
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await pool.query(query, [userId, limit, offset]);
  return rows;
}

export async function compareKin(
  userIdA: number,
  userIdB: number
): Promise<KinCompareResult> {
  const query = `--sql
    SELECT
      -- 1. Overall Score (Total Taste DNA)
      (1 - (u1.profile_vector <=> u2.profile_vector)) AS "overallScore",
      
      -- 2. Genre Segment Score
      -- Slice the vector to the Genre segment and calculate Cosine Similarity
      (1 - (u1.profile_vector${GENRE_SLICE} <=> u2.profile_vector${GENRE_SLICE})) AS "genreScore",
      
      -- 3. Decade Segment Score
      (1 - (u1.profile_vector${DECADE_SLICE} <=> u2.profile_vector${DECADE_SLICE})) AS "decadeScore",
      
      -- 4. Director Segment Score
      (1 - (u1.profile_vector${DIRECTOR_SLICE} <=> u2.profile_vector${DIRECTOR_SLICE})) AS "directorScore"
      
    FROM users AS u1, users AS u2
    WHERE
      u1.id = $1 -- User A (e.g., the current user)
      AND u2.id = $2 -- User B (the user being compared against)
      AND u1.profile_vector IS NOT NULL
      AND u2.profile_vector IS NOT NULL
  `;

  const { rows } = await pool.query<{
    overallScore: number;
    genreScore: number;
    decadeScore: number;
    directorScore: number;
  }>(query, [userIdA, userIdB]);

  if (rows.length === 0) {
    throw new ApiError(
      "One or both users not found or have no profile vector.",
      404
    );
  }

  const result = rows[0];

  return {
    overallScore: result.overallScore,
    segments: {
      genre: result.genreScore,
      decade: result.decadeScore,
      director: result.directorScore,
    },
  };
}
