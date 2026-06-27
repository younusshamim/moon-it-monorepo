// Typed env for db *tooling* only — migrations, seed, and drizzle-kit. The runtime client takes
// its connection string explicitly (dependency injection, see client.ts), so apps inject their own
// validated env and this module is never imported on a hot request path. (INFRASTRUCTURE.md §5.)
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.url(),
});

export const env = EnvSchema.parse(process.env);
