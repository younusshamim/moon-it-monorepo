import type { QueryClient } from "@tanstack/react-query";
import { isServer } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query/query-client";

// Resolve the right QueryClient per environment (TanStack's recommended App Router pattern):
//  - Server: a fresh client per request, so one user's prefetched data never bleeds into another's.
//  - Browser: a singleton, so React suspending during the initial render doesn't throw the cache away.
let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
