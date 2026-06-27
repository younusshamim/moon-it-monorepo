// Programmatic migration runner — for integration tests (Testcontainers) and CI, which need to
// apply migrations against an ephemeral database from code. `pnpm db:migrate` uses the drizzle-kit
// CLI instead. (INFRASTRUCTURE.md §7, §10.)
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const migrationsFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

/** Apply all pending migrations, then close the connection. */
export async function runMigrations(connectionString: string): Promise<void> {
  const client = postgres(connectionString, { max: 1 });
  try {
    await migrate(drizzle(client), { migrationsFolder });
  } finally {
    await client.end();
  }
}
