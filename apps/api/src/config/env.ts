// The single typed entry point for environment configuration (INFRASTRUCTURE.md §5).
// This is the ONLY file permitted to read `process.env` — Biome bans it everywhere else.
// The app crashes on boot if env is invalid (Zod throws), never lazily, never half-configured.
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().min(1).default("0.0.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  // Required secrets / connections.
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),

  // Optional observability sinks — wiring stays inert when unset.
  SENTRY_DSN: z.url().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

// Drop empty-string vars (e.g. `SENTRY_DSN=` from .env) so optional fields fall back to undefined
// instead of failing format validation.
const rawEnv = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ""));

export const env: Env = EnvSchema.parse(rawEnv);
