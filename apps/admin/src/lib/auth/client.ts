// Better Auth browser client. It talks to the Better Auth handler mounted on the NestJS API, reached
// same-origin through the Next rewrite (`/api/auth/*` → API — see next.config.ts). No `baseURL` is
// needed: the client defaults to the current origin plus the `/api/auth` base path, so sign-in sets
// the httpOnly session cookie on the admin origin — where the proxy's `hasSession` check and the
// server-side `/v1/me` read both expect it.
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
