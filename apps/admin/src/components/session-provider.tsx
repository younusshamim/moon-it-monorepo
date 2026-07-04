"use client";

// Distributes the current principal (fetched server-side from `/v1/me` in the dashboard layout) to the
// authenticated shell. Components read the user via `useSession()` and gate affordances with
// `useHasPermission()` — a client mirror of the server checks, never the security boundary (every
// mutation is still authorized by the API guards + service branch checks).
import type { PermissionKey, SessionUser } from "@moonit/schema";
import { createContext, type ReactNode, useContext } from "react";

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

/** The authenticated principal. Throws if used outside the dashboard shell (a wiring bug). */
export function useSession(): SessionUser {
  const user = useContext(SessionContext);
  if (!user) {
    throw new Error("useSession must be used within <SessionProvider>");
  }
  return user;
}

/** Returns a predicate that tests whether the current user holds a permission key (in any scope). */
export function useHasPermission(): (permission: PermissionKey) => boolean {
  const user = useSession();
  return (permission) => user.permissions.includes(permission);
}
