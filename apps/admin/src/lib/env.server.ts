// Server-side env: secrets and server-only config, validated once with Zod (INFRASTRUCTURE.md §5).
// `import "server-only"` makes the build fail loudly if this module is ever pulled into a client
// bundle, so server config can never leak to the browser. The app crashes on boot if env is invalid.
import "server-only";
import { z } from "zod";

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  // Base URL the server (RSC, Server Actions, prefetch) uses to reach the NestJS API. May be a
  // private/internal hostname in production, distinct from the browser-facing NEXT_PUBLIC_API_URL.
  API_URL: z.url(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

// Drop empty-string vars (e.g. `FOO=` in .env) so optionals fall back to undefined / defaults rather
// than failing format validation — mirrors the apps/api env loader.
const rawEnv = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ""));

export const serverEnv: ServerEnv = ServerEnvSchema.parse(rawEnv);
