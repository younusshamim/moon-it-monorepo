// Centralized query-key factory. Keeping keys in one typed place keeps invalidation honest and
// prevents the stringly-typed key sprawl that breaks `invalidateQueries` across a large dashboard.
// Each domain adds its own namespace here as feature modules land (e.g. students, batches, payments).

export const queryKeys = {
  health: () => ["health"] as const,
} as const;
