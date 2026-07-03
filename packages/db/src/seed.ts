// Idempotent seed — local + test only (INFRASTRUCTURE.md §7). Safe to run repeatedly: every insert is
// guarded by `onConflictDoNothing` against a unique key. Seeds the founding branches, the system roles,
// the permission catalog, and each role's permission grants — the baseline auth (Phase 4+) needs.
// No credentials here: the super-admin *credential* is created via Better Auth in a later phase.

import { pathToFileURL } from "node:url";
import { PERMISSION_CATALOG, ROLE_PERMISSION_GRANTS } from "@moonit/schema";
import { createDbClient } from "./client.js";
import { branches, permissions, rolePermissions, roles } from "./schema/index.js";

// System roles — keys mirror @moonit/auth `ROLES` and @moonit/schema `ROLE_PERMISSION_GRANTS`.
const SYSTEM_ROLES = [
  { key: "super_admin", name: "Super Admin" },
  { key: "branch_admin", name: "Branch Admin" },
  { key: "staff", name: "Staff" },
  { key: "instructor", name: "Instructor" },
] as const;

// Founding branches. Extra branches beyond Feni-01 make multi-branch scoping testable (Phase 6).
const BRANCHES = [
  { code: "Feni-01", name: "Head Office — Feni" },
  { code: "CTG-01", name: "Chattogram Branch" },
];

/** Seed baseline reference data. Connection string is injected so tests pass their own. */
export async function seed(connectionString: string): Promise<void> {
  const { db, client } = createDbClient(connectionString, { max: 1 });
  try {
    await db.insert(branches).values(BRANCHES).onConflictDoNothing({ target: branches.code });

    await db
      .insert(roles)
      .values(SYSTEM_ROLES.map((role) => ({ ...role, isSystem: true })))
      .onConflictDoNothing({ target: roles.key });

    await db
      .insert(permissions)
      .values(PERMISSION_CATALOG.map((p) => ({ key: p.key, description: p.description })))
      .onConflictDoNothing({ target: permissions.key });

    // Resolve role/permission keys to ids, then seed the grant rows (composite-PK conflict = no-op).
    const [roleRows, permissionRows] = await Promise.all([
      db.select({ id: roles.id, key: roles.key }).from(roles),
      db.select({ id: permissions.id, key: permissions.key }).from(permissions),
    ]);
    const roleIdByKey = new Map(roleRows.map((r) => [r.key, r.id]));
    const permissionIdByKey = new Map(permissionRows.map((p) => [p.key, p.id]));

    const grants: { roleId: string; permissionId: string }[] = [];
    for (const [roleKey, permissionKeys] of Object.entries(ROLE_PERMISSION_GRANTS)) {
      const roleId = roleIdByKey.get(roleKey);
      if (!roleId) continue;
      for (const permissionKey of permissionKeys) {
        const permissionId = permissionIdByKey.get(permissionKey);
        if (permissionId) grants.push({ roleId, permissionId });
      }
    }
    if (grants.length > 0) {
      await db.insert(rolePermissions).values(grants).onConflictDoNothing();
    }
  } finally {
    await client.end();
  }
}

// Run directly via `pnpm db:seed` (env is validated only on direct execution, not on import).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { env } = await import("./env.js");
  await seed(env.DATABASE_URL);
  console.warn("[seed] complete");
}
