import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";

// Factory for a QueryClient with SSR-friendly defaults (INFRASTRUCTURE.md §6).
// A non-zero `staleTime` avoids an immediate client refetch of data the server just sent, and the
// `dehydrate` override lets us stream *pending* prefetched queries from RSCs (the no-await prefetch
// pattern) so the client picks them up as they resolve.
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}
