import pool from "../db/db.js";
import { ApiError } from "../errors/customErrors.js";

export async function askConnection(senderId: number, receiverId: number) {
  const existingUser = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE id = $1",
    [receiverId],
  );

  if (existingUser.rows.length === 0) {
    throw new ApiError("Target Id does not exist.", 404);
  }

  const lowerId = Math.min(senderId, receiverId);
  const higherId = Math.max(senderId, receiverId);

  const existingConnection = await pool.query(
    "SELECT 1 FROM user_connections WHERE user_id_a = $1 AND user_id_b = $2",
    [lowerId, higherId],
  );

  if (existingConnection.rows.length > 0) {
    throw new ApiError("Users are already connected.", 400);
  }

  const acceptQuery = `--sql
    WITH deleted_request AS (
      DELETE FROM connection_request 
      WHERE sender_id = $2 AND receiver_id = $1
      RETURNING 1
    )
    INSERT INTO user_connections (user_id_a, user_id_b)
    SELECT $3, $4 FROM deleted_request
    RETURNING 1
  `;
  const acceptResult = await pool.query(acceptQuery, [
    senderId,
    receiverId,
    lowerId,
    higherId,
  ]);
  if (acceptResult.rows.length > 0) {
    return { status: "connected", message: "Connection established." };
  }

  const insertQuery = `--sql
    INSERT INTO connection_request (sender_id, receiver_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING 1
  `;
  const insertResult = await pool.query(insertQuery, [senderId, receiverId]);
  if (insertResult.rows.length === 0) {
    throw new ApiError("Connection request already sent.", 400);
  }
  return { status: "pending", message: "Connection request sent." };
}

export async function getRequests(
  userId: number,
  limit: number,
  offset: number,
) {
  const query = `--sql
    SELECT cr.sender_id, u.username, cr.created_at
    FROM connection_request cr
    JOIN users u ON cr.sender_id = u.id
    WHERE cr.receiver_id = $1
    ORDER BY cr.created_at ASC
    LIMIT $2
    OFFSET $3
    `;
  const { rows } = await pool.query(query, [userId, limit, offset]);
  return rows;
}

export async function rejectConnectionRequest(
  userId: number,
  targetId: number,
) {
  const query = `--sql
    DELETE FROM connection_request
    WHERE sender_id = $2 AND receiver_id = $1
    RETURNING 1
  `;
  const { rows } = await pool.query(query, [userId, targetId]);
  return rows;
}

export async function cancelConnection(userId: number, targetId: number) {
  const query = `--sql
    DELETE FROM user_connections
    WHERE user_id_a = $2 AND user_id_b = $1 OR
        user_id_a = $1 AND user_id_b = $2
    RETURNING 1
  `;
  const { rows } = await pool.query(query, [userId, targetId]);
  return rows;
}

export async function blockUser(blockerId: number, blockedId: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const lowerId = Math.min(blockerId, blockedId);
    const higherId = Math.max(blockerId, blockedId);

    // Remove any existing connection
    await client.query(
      "DELETE FROM user_connections WHERE user_id_a = $1 AND user_id_b = $2",
      [lowerId, higherId],
    );

    // Remove any pending connection requests between the two users
    await client.query(
      "DELETE FROM connection_request WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)",
      [blockerId, blockedId],
    );

    // Block the user
    const { rows } = await client.query(
      "INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2) RETURNING *",
      [blockerId, blockedId],
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
