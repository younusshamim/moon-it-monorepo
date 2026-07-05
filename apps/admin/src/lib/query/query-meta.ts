// Typed `meta` for TanStack Query. Module augmentation of the `Register` interface makes `meta` on
// `useQuery`/`useMutation` strongly typed everywhere, so the global cache handlers in `query-client.ts`
// can read these flags without casts. See https://tanstack.com/query/latest/docs/reference/MutationCache.
import "@tanstack/react-query";

export interface AppMutationMeta {
  /**
   * Opt a mutation out of the global error toast (see `query-client.ts`). Use when a screen fully owns
   * its error presentation (e.g. a wizard that inlines every failure). Rare — the default global toast
   * is the safety net that stops mutations from failing silently.
   */
  skipGlobalErrorToast?: boolean;
}

export interface AppQueryMeta {
  /** A human label for the resource, used to phrase a fallback error message if one is ever surfaced. */
  resourceLabel?: string;
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: AppMutationMeta;
    queryMeta: AppQueryMeta;
  }
}
