import {
  defaultShouldDehydrateQuery,
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import { errorMessage } from "@/lib/api/error-message";
import "@/lib/query/query-meta";

// Factory for a QueryClient with SSR-friendly defaults plus centralized error handling
// (INFRASTRUCTURE.md §6; docs/architecture-review/12-frontend-api-handling.md).
//
// A non-zero `staleTime` avoids an immediate client refetch of data the server just sent, and the
// `dehydrate` override lets us stream *pending* prefetched queries from RSCs so the client picks them
// up as they resolve.
//
// Error handling is centralized on the cache callbacks (the TanStack-recommended pattern), not repeated
// at every call site:
//   - A 401 anywhere means the session expired → bounce to /login once (the API is the real gate; this
//     is just UX so the user isn't left staring at failed requests).
//   - Mutation failures toast automatically, so a mutation can never fail silently. Opt out with
//     `meta: { skipGlobalErrorToast: true }` when a screen fully owns its error UI.
//   - Query failures do NOT toast: list/detail components render inline error states, and a toast on
//     every background refetch failure would be noise. The 401 redirect still applies.
// All of this is browser-only — on the server (per-request prefetch) there's no `toast`/`window`.

function redirectToLogin(): void {
  if (isServer || typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  window.location.href = "/login";
}

function handleUnauthorized(error: unknown): boolean {
  if (error instanceof ApiError && error.isUnauthorized) {
    redirectToLogin();
    return true;
  }
  return false;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        handleUnauthorized(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (handleUnauthorized(error)) return;
        if (isServer) return;
        if (mutation.meta?.skipGlobalErrorToast) return;
        toast.error(errorMessage(error, "Something went wrong. Please try again."));
      },
    }),
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
