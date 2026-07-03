// Translate low-level postgres.js driver errors into @moonit/core domain errors, so repositories can
// surface a clean ConflictError (→ 409) on a unique violation instead of leaking a 500. Errors that
// don't match are returned unchanged for the caller to rethrow (docs/API_AND_AUTH_PLAN.md, Phase 0).
import { ConflictError } from "@moonit/core";

// postgres.js sets `.code` to the Postgres SQLSTATE on query errors. 23505 = unique_violation.
const UNIQUE_VIOLATION = "23505";

function isPgError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

/**
 * Map a caught DB error to a domain error when it is a unique-constraint violation, else return it
 * unchanged. Usage: `catch (error) { throw mapPgError(error, { conflict: "Branch code taken" }); }`
 */
export function mapPgError(error: unknown, messages?: { conflict?: string }): unknown {
  if (isPgError(error) && error.code === UNIQUE_VIOLATION) {
    return new ConflictError(messages?.conflict ?? "Resource already exists");
  }
  return error;
}
