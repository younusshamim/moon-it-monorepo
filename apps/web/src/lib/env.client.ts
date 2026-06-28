// Client-side env: only `NEXT_PUBLIC_*` vars, validated once with Zod (INFRASTRUCTURE.md §5).
// These are inlined into the browser bundle by Next, so each must be referenced by its full literal
// `process.env.NEXT_PUBLIC_*` name (no dynamic access). This module is safe to import anywhere —
// server or client. Never read `process.env` directly elsewhere; Biome bans it outside env files.
import { z } from "zod";

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url().optional(),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

export const clientEnv: ClientEnv = ClientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
});
