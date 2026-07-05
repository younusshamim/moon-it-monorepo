// Bridge server-side validation failures back onto a React Hook Form. When the API rejects a mutation
// with 422 field issues (see @moonit/core `ValidationError.issues` → `ApiError.issues`), map each issue
// onto the matching form field so the message renders inline next to the input — the same place the
// client-side Zod errors show. This is the standard "trust the client validation, but honor the server
// as the source of truth" pattern: RHF validates first, and anything only the server can know (unique
// constraints, cross-entity checks) still lands on the right field instead of a bare toast.
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api/api-error";

/**
 * Map an API error's field issues onto a form. Returns `true` when at least one issue was applied (the
 * caller can then leave the drawer open and skip any generic handling), `false` otherwise (e.g. a 409
 * conflict or 500 with no field path — let the global error toast surface it).
 */
export function applyApiErrorToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!(error instanceof ApiError) || !error.hasFieldIssues) return false;

  let applied = false;
  for (const issue of error.issues ?? []) {
    const name = issue.path.join(".");
    if (!name) continue;
    setError(name as Path<T>, { type: "server", message: issue.message });
    applied = true;
  }
  return applied;
}
