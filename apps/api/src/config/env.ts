// The single typed entry point for environment configuration (INFRASTRUCTURE.md §5).
// This is the ONLY file permitted to read `process.env` — Biome bans it everywhere else.
// The app crashes on boot if env is invalid (Zod throws), never lazily, never half-configured.
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().min(1).default("0.0.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  // Required secrets / connections.
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  // Public origin the API is reached at, so Better Auth builds absolute URLs and trusts the origin.
  // Optional: when unset Better Auth derives it from the incoming request (fine for local dev).
  BETTER_AUTH_URL: z.url().optional(),
  // Comma-separated browser origins allowed to authenticate (the admin web app). The web reaches the
  // API same-origin via a Next rewrite, which forwards the browser's `Origin`; Better Auth's CSRF
  // check must trust it. Optional; when unset only the request-derived origin is trusted.
  WEB_ORIGIN: z.string().optional(),

  // Optional observability sinks — wiring stays inert when unset.
  SENTRY_DSN: z.url().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

// Drop empty-string vars (e.g. `SENTRY_DSN=` from .env) so optional fields fall back to undefined
// instead of failing format validation.
const rawEnv = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ""));

export const env: Env = EnvSchema.parse(rawEnv);
