import { useQuery } from '@tanstack/react-query';
import { fetchMessages } from '../queries/messages';

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: fetchMessages,
  });
}

