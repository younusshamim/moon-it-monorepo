// drizzle-kit config — generation & migration only (INFRASTRUCTURE.md §5, §7).
// `generate` runs offline, so DATABASE_URL falls back to a local dev DSN; `migrate`/`push`/`studio`
// require a real DATABASE_URL in the environment. pgvector is enabled by a hand-written init
// migration (0000), not by drizzle-kit.
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/moonit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  casing: "snake_case",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
