// Server-side read of the current principal from the API's `GET /v1/me` (identity + roles + effective
// permissions + branch scope). Used by the dashboard layout to gate the shell and seed the client
// SessionProvider. `serverApiFetch` forwards the caller's session cookie to the internal API; a 401
// (no/expired session) resolves to `null` so the layout can bounce to /login.
import "server-only";
import { type SessionUser, SessionUserSchema } from "@moonit/schema";
import { ApiError } from "@/lib/api/api-error";
import { serverApiFetch } from "@/lib/api/server-fetch";

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    return await serverApiFetch("/v1/me", { schema: SessionUserSchema });
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      return null;
    }
    throw error;
  }
}
