import pool from "../db/db.js";
import { ApiError } from "../errors/customErrors.js";

export async function getKinListbyId(userId: number, filter: string, limit: number, offset: number) {
  const connectOnly = filter === 'connected';
  const unconnectedOnly = filter === 'unconnected';

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

export async function compareKin (userId: number, targetId: number) {
  const query = `--sql
    
  `
}