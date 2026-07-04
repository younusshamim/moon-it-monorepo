// Extract a user-facing message from a thrown value. `ApiError` (and any Error) already carries the
// API's `message` (e.g. "You do not have access to this branch"), so surface it; otherwise fall back.
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
