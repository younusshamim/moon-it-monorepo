// @moonit/db — Drizzle schema, migrations, pgvector, and the client factory. The only place
// Drizzle and the Postgres driver live; never pulled into a client bundle. See INFRASTRUCTURE.md §2, §7.
export * from "./client.js";
export * from "./migrate.js";
export * from "./schema/index.js";
export { seed } from "./seed.js";
