#!/usr/bin/env node
// Guards @moonit/schema's zero-dependency invariant (architecture-review doc-03, Implementation
// Step 4). The contract package is imported by the browser bundle, the edge proxy, the API, and the
// seed script, so its only runtime dependency may ever be `zod`. Anything else (drizzle-orm, a Nest
// package, react, ...) would break every consumer and invert the source-of-truth direction. This
// script turns that architecture rule into a check; it's wired into the root `lint` script.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ALLOWED = new Set(["zod"]);
const pkgPath = fileURLToPath(new URL("../../packages/schema/package.json", import.meta.url));

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const deps = Object.keys(pkg.dependencies ?? {});
const offenders = deps.filter((name) => !ALLOWED.has(name));

if (offenders.length > 0) {
  console.error(
    `\n✖ @moonit/schema must depend on \`zod\` only, but found: ${offenders.join(", ")}.\n` +
      `  It is imported by the browser bundle, edge proxy, API, and seed — a framework/runtime\n` +
      `  dependency here breaks every consumer. See packages/schema/README.md.\n`,
  );
  process.exit(1);
}

console.warn("✓ @moonit/schema dependency invariant holds (zod only).");
