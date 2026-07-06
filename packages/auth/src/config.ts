// The Better Auth server config — the auth server the login/signout stubs are waiting on. Wires Better
// Auth onto the *existing* Drizzle tables (INFRASTRUCTURE.md §9, docs/API_AND_AUTH_PLAN.md Phase 4):
// Better Auth's `user` model → `iam.users`, `session` → `auth_sessions`, `account` → `auth_accounts`,
// `verification` → `auth_verifications`. Credential hashes live in `auth_accounts.password`, never on
// the user row. HTTP routes + the NestJS guard mount in Phase 5; this file is only the factory.
import type { Database } from "@moonit/db";
import { authAccounts, authSessions, authVerifications, users } from "@moonit/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export interface CreateAuthDeps {
  /** The Drizzle client (from `createDbClient`). Injected so tests/apps own their connection. */
  db: Database;
  /** `BETTER_AUTH_SECRET` — validated by the caller's env (min 32 chars). */
  secret: string;
  /** Public base URL; only needed once the request handler mounts (Phase 5). */
  baseURL?: string;
  /**
   * Browser origins allowed to authenticate (e.g. the admin web app). The web reaches the API
   * same-origin through a Next rewrite that forwards the browser's `Origin`, so Better Auth's CSRF
   * check must trust those origins. Omit to trust only the request-derived origin.
   */
  trustedOrigins?: string[];
}

/**
 * Build the configured Better Auth instance. Email + password only; ids are DB-generated
 * (`shared.id()` → `defaultRandom()`), so `generateId: false` defers to the DB and reads back via
 * `.returning()`. The Drizzle client already sets `casing: "snake_case"`, so the camelCase schema
 * property keys drive column translation — only `name → fullName` needs an explicit field remap.
 *
 * CSRF / cookie posture (verified against the installed Better Auth v1.6.23 docs, 2026-07-06):
 * - No `advanced.cookies`/`useSecureCookies` override here — Better Auth's own defaults already do
 *   the right thing: the session cookie is `httpOnly`, `sameSite: "lax"`, and gets `secure` (plus the
 *   `__Secure-` name prefix) automatically whenever `baseURL` is an `https:` URL. In prod that means
 *   setting `BETTER_AUTH_URL` to an https origin is what turns `secure` on — nothing to configure here.
 *   Local dev's http `baseURL` intentionally omits `secure`; that's expected, not a gap.
 * - `advanced.disableCSRFCheck` / `disableOriginCheck` are left at their defaults (both `false`, i.e.
 *   the checks are ON), so Better Auth's own origin-allowlist check (against `trustedOrigins`) already
 *   protects every `/api/auth/*` endpoint. Nothing to add.
 * - The hand-rolled `/v1/*` mutations (outside Better Auth's handler, see `apps/api`'s
 *   `DomainExceptionFilter`/Zod pipeline) are NOT covered by the above, but are effectively CSRF-safe
 *   for a simpler reason, confirmed empirically (2026-07-06, local `curl`): Nest's global `AuthGuard`
 *   runs before the `ZodValidationPipe`, so ANY request without a valid session cookie gets a 401
 *   before its body/content-type is even inspected — and `SameSite=Lax` means a cross-site request
 *   (form POST, `<img>`, etc.) never attaches that cookie in the first place, so it's indistinguishable
 *   from an anonymous request. The content-type check is a secondary layer for an *authenticated*
 *   same-site caller sending a malformed body, not the CSRF boundary itself.
 *   This is this app's own design decision, not something the Better Auth docs vouch for — revisit if
 *   `/v1/*` ever needs to accept non-JSON bodies or gets exposed to a non-same-origin caller.
 */
export function createAuth(deps: CreateAuthDeps) {
  return betterAuth({
    secret: deps.secret,
    ...(deps.baseURL ? { baseURL: deps.baseURL } : {}),
    ...(deps.trustedOrigins ? { trustedOrigins: deps.trustedOrigins } : {}),
    telemetry: { enabled: false },
    // Better Auth writes `Date`s to `users`; the shared `isoTimestamp` column type (@moonit/db)
    // coerces them to ISO strings at the driver boundary, so no client wrapper is needed here.
    database: drizzleAdapter(deps.db, {
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
