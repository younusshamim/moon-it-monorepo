import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @moonit/ui ships TypeScript/JSX source (Just-in-Time, INFRASTRUCTURE.md §2), so Next must
  // transpile it. The other internal packages (auth, core, schema) resolve to compiled `dist`.
  transpilePackages: ["@moonit/ui"],
  typedRoutes: true,
};

export default nextConfig;
