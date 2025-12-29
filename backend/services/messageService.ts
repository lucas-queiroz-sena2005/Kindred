import pool from "../db/db.js";
import { ApiError } from "../errors/customErrors.js";

export async function getMessages(
  userId: number,
  targetId: number,
  limit: number,
  offset: number,
) {
  const existingUser = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE id = $1",
    [targetId],
  );

  if (existingUser.rows.length === 0) {
    throw new ApiError("Target Id does not exist.", 404);
  }
  const query = `--sql
    SELECT * FROM messages
    WHERE (sender_id = $1 AND receiver_id = $2) OR
        (receiver_id = $1 AND sender_id = $2)
    ORDER BY created_at ASC
    LIMIT $3
    OFFSET $4
    `;
  const { rows } = await pool.query(query, [userId, targetId, limit, offset]);
  return rows;
}

export async function sendMessage(
  senderId: number,
  receiverId: number,
  message: string,
) {
  const existingUser = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE id = $1",
    [receiverId],
  );

  if (existingUser.rows.length === 0) {
    throw new ApiError("Target Id does not exist.", 404);
  }
  const query = `--sql
    INSERT INTO messages (sender_id, receiver_id, content)
    VALUES ($1, $2, $3)`;
  const { rows } = await pool.query(query, [senderId, receiverId, message]);
  return rows;
}
