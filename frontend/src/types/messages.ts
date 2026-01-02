export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ConversationUser {
  id: number;
  username: string;
  lastMessageAt: string;
}
