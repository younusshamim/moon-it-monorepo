// The Better Auth server config — the auth server the login/signout stubs are waiting on. Wires Better
// Auth onto the *existing* Drizzle tables (INFRASTRUCTURE.md §9, docs/API_AND_AUTH_PLAN.md Phase 4):
// Better Auth's `user` model → `iam.users`, `session` → `auth_sessions`, `account` → `auth_accounts`,
// `verification` → `auth_verifications`. Credential hashes live in `auth_accounts.password`, never on
// the user row. HTTP routes + the NestJS guard mount in Phase 5; this file is only the factory.
import type { Database } from "@moonit/db";
import { authAccounts, authSessions, authVerifications, users } from "@moonit/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { withUserDateShim } from "./user-date-shim.js";

export interface CreateAuthDeps {
  /** The Drizzle client (from `createDbClient`). Injected so tests/apps own their connection. */
  db: Database;
  /** `BETTER_AUTH_SECRET` — validated by the caller's env (min 32 chars). */
  secret: string;
  /** Public base URL; only needed once the request handler mounts (Phase 5). */
  baseURL?: string;
}

/**
 * Build the configured Better Auth instance. Email + password only; ids are DB-generated
 * (`shared.id()` → `defaultRandom()`), so `generateId: false` defers to the DB and reads back via
 * `.returning()`. The Drizzle client already sets `casing: "snake_case"`, so the camelCase schema
 * property keys drive column translation — only `name → fullName` needs an explicit field remap.
 */
export function createAuth(deps: CreateAuthDeps) {
  return betterAuth({
    secret: deps.secret,
    ...(deps.baseURL ? { baseURL: deps.baseURL } : {}),
    telemetry: { enabled: false },
    database: drizzleAdapter(withUserDateShim(deps.db), {
      provider: "pg",
      schema: {
        user: users,
        session: authSessions,
        account: authAccounts,
        verification: authVerifications,
      },
    }),
    emailAndPassword: { enabled: true },
    // `phone`/`status` stay owned by the IAM API (DB defaults / nullable); Better Auth only touches
    // the core user fields, mapping its `name` onto our `fullName` column.
    user: { fields: { name: "fullName" } },
    advanced: { database: { generateId: false } },
  });
}

/** The configured Better Auth instance type — consumed by the Phase 5 `AuthModule`. */
export type Auth = ReturnType<typeof createAuth>;
