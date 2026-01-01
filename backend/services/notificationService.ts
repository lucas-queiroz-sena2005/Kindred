import pool from "../db/db";
import { Notification, NotificationType } from "../types/notificationTypes";

export const createNotification = async (
  userId: number,
  type: NotificationType,
  actorId: number
): Promise<Notification> => {
  const result = await pool.query(
    "INSERT INTO notifications (user_id, type, actor_id) VALUES ($1, $2, $3) RETURNING *",
    [userId, type, actorId]
  );
  return result.rows[0];
};

export const getNotificationsAndMarkAsRead = async (
  userId: number
): Promise<Notification[]> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const notificationsResult = await client.query(
      `SELECT n.*, u.username as actor_username
       FROM notifications n
       JOIN users u ON n.actor_id = u.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    await client.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
      [userId]
    );
    await client.query("COMMIT");

    return notificationsResult.rows;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

export const getUnreadNotificationCount = async (
  userId: number
): Promise<number> => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE",
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};
