// Bootstrap the founding super-admin — the one credential the seed can't create (the seed is
// credential-free, and @moonit/db can't depend on @moonit/auth without a cycle). Creates the domain
// `users` row + hashed `auth_accounts.password` via Better Auth's own server API, then assigns the
// `super_admin` role with `branchId = null` (all branches). Idempotent: safe to run repeatedly.
// Requires the Phase 3 seed to have run first (the `super_admin` role must exist).

import { pathToFileURL } from "node:url";
import { createDbClient, type Database, roles, userRoles, users } from "@moonit/db";
import { and, eq, isNull } from "drizzle-orm";
import { createAuth } from "./config.js";

export interface BootstrapSuperAdminDeps {
  db: Database;
  secret: string;
  email: string;
  password: string;
  name: string;
}

/**
 * Ensure a founding super-admin exists (user + credential + role grant). Returns the user id.
 * Each step no-ops if already present, so re-runs are a safe no-op.
 */
export async function bootstrapSuperAdmin(deps: BootstrapSuperAdminDeps): Promise<string> {
  const { db, secret, password, name } = deps;
  // Better Auth lowercases emails on sign-up; match that so lookups don't miss on re-run.
  const email = deps.email.toLowerCase();
  const auth = createAuth({ db, secret });

  // 1. User + hashed credential. Only sign up when the user doesn't already exist.
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let userId = existing[0]?.id;
  if (!userId) {
    const result = await auth.api.signUpEmail({ body: { email, password, name } });
    userId = result.user.id;
  }

  // 2. Resolve the seeded super_admin role.
  const [role] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.key, "super_admin"))
    .limit(1);
  if (!role) {
    throw new Error(
      'bootstrapSuperAdmin: "super_admin" role not found — run the Phase 3 seed (db:seed) first.',
    );
  }

  // 3. Idempotent role grant. `unique(userId, roleId, branchId)` treats NULL branchId as distinct, so
  //    onConflictDoNothing can't dedupe here — check for an existing all-branches grant explicitly.
  const grant = await db
    .select({ id: userRoles.id })
    .from(userRoles)
    .where(
      and(eq(userRoles.userId, userId), eq(userRoles.roleId, role.id), isNull(userRoles.branchId)),
    )
    .limit(1);
  if (!grant[0]) {
    await db.insert(userRoles).values({ userId, roleId: role.id, branchId: null });
  }

  return userId;
}

// Run directly via `pnpm --filter @moonit/auth auth:bootstrap` (env validated only on execution).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { env } = await import("./env.js");
  const { db, client } = createDbClient(env.DATABASE_URL, { max: 1 });
  try {
    const userId = await bootstrapSuperAdmin({
      db,
      secret: env.BETTER_AUTH_SECRET,
      email: env.SUPER_ADMIN_EMAIL,
      password: env.SUPER_ADMIN_PASSWORD,
      name: env.SUPER_ADMIN_NAME,
    });
    console.warn(`[bootstrap] super-admin ready (user ${userId})`);
  } finally {
    await client.end();
  }
}
