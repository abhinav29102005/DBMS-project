import { QueryClient } from '@tanstack/react-query';

/**
 * Configure the TanStack Query client.
 * defaultOptions:
 * - staleTime: 5 minutes (data remains fresh for 5 mins)
 * - retry: 1 (retry failed requests once)
 * - refetchOnWindowFocus: false (reduce unnecessary API calls)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
