import type { NextConfig } from "next";

// The NestJS API is a separate origin. Rather than call it cross-origin from the browser (which forces
// CORS + `SameSite=None` cookies), we proxy it under the admin's own origin so the httpOnly Better Auth
// session cookie flows for both client fetches and server (`cookies()`) reads, identically in dev and
// prod. `/v1/*` is the versioned REST surface; `/api/auth/*` is the Better Auth handler. `env.server.ts`
// can't be imported here (it's `server-only`, which throws outside RSC), so read the internal URL from
// the environment directly — Biome allows `process.env` in `next.config.ts` (see biome.json override).
const API_URL = process.env.API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @moonit/ui ships TypeScript/JSX source (Just-in-Time, INFRASTRUCTURE.md §2), so Next must
  // transpile it. The other internal packages (auth, core, schema) resolve to compiled `dist`.
  transpilePackages: ["@moonit/ui"],
  typedRoutes: true,
  async rewrites() {
    return [
      { source: "/v1/:path*", destination: `${API_URL}/v1/:path*` },
      { source: "/api/auth/:path*", destination: `${API_URL}/api/auth/:path*` },
    ];
  },
};

export default nextConfig;
