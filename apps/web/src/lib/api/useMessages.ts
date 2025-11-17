import { useQuery } from "@tanstack/react-query";
import { type MessageWithTag } from "db";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function useMessages() {
  return useQuery<MessageWithTag[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/messages`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    },
  });
}
