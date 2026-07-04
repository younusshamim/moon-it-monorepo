// Typed env for the bootstrap *script* only (see bootstrap.ts). Mirrors @moonit/db's env module:
// the runtime `createAuth` factory takes its secret/connection explicitly (dependency injection), so
// this module is imported lazily inside the direct-execution block and never on a hot request path.
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  SUPER_ADMIN_EMAIL: z.email(),
  SUPER_ADMIN_PASSWORD: z.string().min(8),
  SUPER_ADMIN_NAME: z.string().min(1),
});

export const env = EnvSchema.parse(process.env);
