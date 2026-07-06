# @moonit/schema

The single **Zod contract** for the platform. Every domain entity is authored here once; the API
DTOs (`createZodDto`), the OpenAPI document, the frontend's React Hook Form resolvers and response
parsing, and the DB seed all derive from these schemas.

For each table a module exports a canonical entity schema (the full select row) plus `New*` (create)
and `Update*` (`.partial()`) derivations, and the inferred TypeScript types.

## Three invariants — do not break these

1. **Runtime dependency on `zod` only.** This package is imported by the browser bundle, the edge
   proxy, the NestJS API, and the seed script. It must never gain a framework/runtime dependency
   (no `drizzle-orm`, no `@nestjs/*`, no `react`). That zero-dependency property is what makes the
   contract safely importable everywhere. A root check can enforce this in CI.

2. **Zod is the authored source of truth; `@moonit/db` conforms.** The Drizzle tables are
   hand-written peers of these schemas, not the other way around. Correspondence is enforced by the
   compiler in [`packages/db/src/type-drift.ts`](../db/src/type-drift.ts): each entity asserts that
   the Drizzle select-row type equals the Zod entity type, so drift fails `tsc` instead of reaching
   runtime.

   > **We deliberately do not use `drizzle-zod`.** Generating Zod _from_ Drizzle would invert the
   > source of truth (the DB would define the public API), and would drag `drizzle-orm` into every
   > consumer of this package — breaking invariant #1. The API here is a designed contract, not a
   > mirror of the tables; keeping it authored + enforcing conformance is the point. See
   > `docs/architecture-review/11-zod-drizzle-schema-approach.md`.

3. **No `.transform()` / `.preprocess()` in wire schemas.** A schema's input and output JSON Schema
   must coincide (plain JSON in, plain JSON out). Representation quirks are normalized _below_ this
   layer: `timestamptz` is turned into canonical RFC-3339 by `@moonit/db`'s `isoTimestamp` custom
   column type, and Postgres `numeric` is carried as a decimal string end-to-end. If you find
   yourself reaching for a coercion here, fix it at the DB boundary instead.
