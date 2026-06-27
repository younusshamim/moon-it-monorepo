// The Drizzle client factory — the only place the Postgres driver is constructed. The connection
// string is injected (never read from env here) so apps own their env and Testcontainers can swap
// the connection without touching this code (INFRASTRUCTURE.md §6, §15).
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

export type DbSchema = typeof schema;

export interface DbClientOptions {
  /** postgres.js pool size. Default 10. */
  max?: number;
  /** Pass an existing postgres.js client (e.g. a Testcontainers connection) instead of a DSN. */
  client?: postgres.Sql;
}

/**
 * Build a Drizzle client (and the underlying postgres.js handle, for graceful shutdown / raw SQL).
 * `casing: "snake_case"` mirrors the schema so queries map camelCase ↔ snake_case automatically.
 */
export function createDbClient(connectionString: string, options: DbClientOptions = {}) {
  const client = options.client ?? postgres(connectionString, { max: options.max ?? 10 });
  const db = drizzle(client, { schema, casing: "snake_case" });
  return { db, client };
}

export type Database = ReturnType<typeof createDbClient>["db"];
