import { useQuery } from "@tanstack/react-query";
import { type MessageWithTag, type Tag } from "db";

const API_BASE_URL = import.meta.env.VITE_VERCEL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:3000";

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

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/tags`);
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      return response.json();
    },
  });
}