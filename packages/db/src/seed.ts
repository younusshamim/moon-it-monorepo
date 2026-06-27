// Idempotent seed — local + test only (INFRASTRUCTURE.md §7). Safe to run repeatedly: every insert
// is guarded by `onConflictDoNothing` against a unique key. Seeds the single founding branch and the
// system roles, the minimum a fresh install needs (multi-branch is then a data concern, not a migration).
import { pathToFileURL } from "node:url";
import { createDbClient } from "./client.js";
import { branches, roles } from "./schema/index.js";

const SYSTEM_ROLES = [
  { key: "super_admin", name: "Super Admin" },
  { key: "branch_admin", name: "Branch Admin" },
  { key: "instructor", name: "Instructor" },
  { key: "accountant", name: "Accountant" },
  { key: "student", name: "Student" },
] as const;

/** Seed baseline reference data. Connection string is injected so tests pass their own. */
export async function seed(connectionString: string): Promise<void> {
  const { db, client } = createDbClient(connectionString, { max: 1 });
  try {
    await db
      .insert(branches)
      .values({ code: "DHK-01", name: "Head Office — Dhaka" })
      .onConflictDoNothing({ target: branches.code });

    await db
      .insert(roles)
      .values(SYSTEM_ROLES.map((role) => ({ ...role, isSystem: true })))
      .onConflictDoNothing({ target: roles.key });
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
