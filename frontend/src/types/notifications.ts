export type NotificationType = "kin_request" | "kin_accepted" | "new_message";

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  actor_id: number;
  actor_username: string;
  is_read: boolean;
  created_at: string;
}
