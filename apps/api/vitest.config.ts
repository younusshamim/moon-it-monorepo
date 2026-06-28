import { fileURLToPath } from "node:url";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// unplugin-swc handles NestJS decorators + emitDecoratorMetadata under Vitest.
// Aliases mirror tsconfig `paths` so workspace packages resolve to TS source.
const pkg = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
    // Dummy values so the Zod env module (which parses on import) loads under test.
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgres://postgres:postgres@localhost:5432/moonit",
      REDIS_URL: "redis://localhost:6379",
      ANTHROPIC_API_KEY: "test-key",
      BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-123456",
    },
  },
  resolve: {
    alias: {
      "@moonit/core": pkg("../../packages/core/src/index.ts"),
      "@moonit/db": pkg("../../packages/db/src/index.ts"),
      "@moonit/schema": pkg("../../packages/schema/src/index.ts"),
    },
  },
  plugins: [swc.vite({ module: { type: "es6" } })],
});
