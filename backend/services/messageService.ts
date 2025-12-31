import pool from "../db/db.js";
import { Filter } from "bad-words";
import { ApiError } from "../errors/customErrors.js";

const filter = new Filter();

export async function getMessages(
  userId: number,
  targetId: number,
  limit: number,
  offset: number,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existingUser = await client.query<{ id: number }>(
      "SELECT id FROM users WHERE id = $1",
      [targetId],
    );

    if (existingUser.rows.length === 0) {
      throw new ApiError("Target Id does not exist.", 404);
    }

    await client.query(
      `--sql
      UPDATE messages
      SET is_read = TRUE
      WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE`,
      [userId, targetId],
    );

    const query = `--sql
    SELECT * FROM messages
    WHERE (sender_id = $1 AND receiver_id = $2) OR
        (receiver_id = $1 AND sender_id = $2)
    ORDER BY created_at ASC
    LIMIT $3
    OFFSET $4
    `;
    const { rows } = await client.query(query, [
      userId,
      targetId,
      limit,
      offset,
    ]);
    await client.query("COMMIT");
    return rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function sendMessage(
  senderId: number,
  receiverId: number,
  message: string,
) {
  if (filter.isProfane(message)) {
    throw new ApiError("Message contains inappropriate words.", 400);
  }

  const existingUser = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE id = $1",
    [receiverId],
  );

  if (existingUser.rows.length === 0) {
    throw new ApiError("Target Id does not exist.", 404);
  }

  const blockCheckQuery = await pool.query(
    "SELECT 1 FROM user_blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)",
    [senderId, receiverId],
  );

  if (blockCheckQuery.rows.length > 0) {
    throw new ApiError(
      "Cannot send message. User is blocked or has blocked you.",
      403,
    );
  }

  const query = `--sql
    INSERT INTO messages (sender_id, receiver_id, content)
    VALUES ($1, $2, $3)`;
  const { rows } = await pool.query(query, [senderId, receiverId, message]);
  return rows;
}
