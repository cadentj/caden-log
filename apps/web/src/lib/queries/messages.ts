export interface Message {
  id: number;
  message_id: number;
  user_id: number | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  chat_id: number;
  chat_type: string | null;
  text: string | null;
  timestamp: string;
  created_at: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchMessages(): Promise<Message[]> {
  const response = await fetch(`${API_BASE_URL}/api/messages`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
}

