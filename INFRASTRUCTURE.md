# Project Infrastructure Guidelines

> Architecture, conventions, and operating rules for the monorepo.
> This is the source of truth. When in doubt, follow this document; when this document is wrong, fix it in a PR.

---

## 1. Guiding Principles

1. **Type safety end to end.** A type or schema is defined once and flows from DB → API → client. No duplicated shapes, no `any` outside clearly-marked boundaries.
2. **Zod is the contract.** Validation, OpenAPI generation, RHF resolvers, and inferred TS types all derive from the same Zod schemas in `packages/schema`. Zod is the single *authored* source; the Drizzle table is the one peer shape, kept honest by a compile-time drift assertion (§4, §7) rather than by hand.
3. **Apps are thin, packages are smart.** `apps/*` wire things together (routing, DI, deployment). Reusable logic lives in `packages/*`.
4. **The dependency graph points one way.** `apps` → `packages`. Packages never import from apps. Sibling packages depend through explicit, declared edges only.
5. **Everything is reproducible.** Local dev, CI, and prod run the same Postgres/Redis versions via Docker. No "works on my machine."
6. **Boring where it counts.** Use the conventional, well-trodden option for anything load-bearing (auth, migrations, money). Save novelty for places where a regression is cheap.

---

## 2. Repository Layout

```
.
├── apps/
│   ├── web/                      # Next.js 16 admin platform (App Router)
│   └── api/                      # NestJS + Fastify backend
├── packages/
│   ├── schema/                   # Zod schemas — single authored source, derived everywhere
│   ├── db/                       # Drizzle schema, migrations, client factory
│   ├── ai/                       # RAG + chat service (shared by web widget + Messenger)
│   ├── auth/                     # Better Auth config, role definitions, guards
│   ├── ui/                       # shadcn/ui components, design tokens
│   ├── config-ts/                # Shared tsconfig bases
│   └── core/                     # Framework-agnostic utils, result types, errors
├── tooling/
│   ├── docker/                   # docker-compose, Dockerfiles, init scripts
│   └── scripts/                  # repo-level maintenance scripts
├── .changeset/
├── .github/workflows/
├── turbo.json
├── pnpm-workspace.yaml
├── biome.json
├── commitlint.config.ts
└── package.json
```

### Why this shape

- **`apps/` vs `packages/` split** is the standard Turborepo signal and keeps deployable units separate from shared code.
- **`schema` and `db` are separate packages.** `schema` is the wire/validation contract (no DB driver). `db` owns Drizzle and Postgres. The API depends on both; the web app depends on `schema` only. This stops the Postgres driver from ever being pulled into a client bundle.
- **`ai` is a package, not baked into the API.** Both the website streaming widget (Next.js route handler) and the Messenger webhook (NestJS controller) consume the same retrieval + tool-calling core. One implementation, two transports.
- **`tooling/` is not a workspace package.** It holds infra glue that nothing imports at runtime.

### App-internal structure

**`apps/api` (NestJS) — feature modules, not layer folders:**

```
apps/api/src/
├── main.ts                       # Fastify bootstrap, Pino, Sentry, OTel
├── app.module.ts
├── modules/
│   ├── students/
│   │   ├── students.module.ts
│   │   ├── students.controller.ts
│   │   ├── students.service.ts
│   │   ├── students.repository.ts   # Drizzle queries live here, nowhere else
│   │   └── students.controller.spec.ts
│   ├── batches/
│   ├── enrollments/
│   ├── payments/
│   ├── chat/                        # Messenger webhook → BullMQ → ai package
│   └── ...
├── jobs/                            # BullMQ processors (payment-reminder, ingest, messenger)
├── common/                          # guards, interceptors, filters, pipes
└── config/                          # typed env loader, module config factories
```

Group by **feature** (`students/`), not by technical layer (`controllers/`, `services/`). Each module is a self-contained vertical slice. The repository pattern isolates Drizzle: services never write queries inline, which keeps them testable and the data layer swappable.

**`apps/web` (Next.js 16):**

```
apps/web/src/
├── app/
│   ├── (auth)/                      # route groups, no URL segment
│   ├── (dashboard)/
│   │   ├── students/
│   │   │   ├── page.tsx             # RSC, fetches on the server
│   │   │   ├── _components/         # route-private components (underscore = not a route)
│   │   │   └── actions.ts           # Server Actions, "use server"
│   │   └── layout.tsx
│   └── api/
│       └── chat/route.ts            # streaming widget via AI SDK v5
├── components/                      # cross-route app components
├── lib/                             # query client, fetchers, env, utils
├── hooks/
└── stores/                          # Zustand stores
```

Co-locate route-private components under `_components/` (the underscore prefix opts them out of routing). Shared components graduate up to `components/`, then to `packages/ui` once a second app needs them.

### Internal package resolution: source in dev, compiled in prod

`packages/*` consumed by a **Node** runtime (`apps/api`) are **compiled packages**: each builds to `./dist` with `tsc` and declares conditional `exports` so the same package serves source in development and compiled JS in production.

```jsonc
"exports": {
  ".": {
    "development": "./src/index.ts", // dev/test: Node --conditions=development → TS source
    "types": "./dist/index.d.ts",     // typecheck: built declarations
    "default": "./dist/index.js"       // prod: compiled JS
  }
}
```

- **Dev / test** run with `node --conditions=development` (the API via `@swc-node/register`; Vitest via a `resolve.alias` to `src`), so editing a package is reflected instantly — no rebuild, no `paths` mapping.
- **Typecheck** resolves the `types` condition → built `dist/*.d.ts`; Turborepo builds dependencies first via `dependsOn: ["^build"]`.
- **Prod** resolves `default` → `dist`. `apps/api` itself compiles with the **SWC CLI** (`swc src -d dist`, decorator metadata preserved) and runs as `node dist/main.js` — a self-contained, compiled artifact. NestJS forces an SWC/tsc toolchain (not esbuild/oxc) because it relies on `emitDecoratorMetadata`; for the same reason `apps/api` overrides `verbatimModuleSyntax`/`isolatedModules` and disables Biome's `useImportType`.

`packages/ui` stays **Just-in-Time** (`exports` → source): it is consumed only by the bundled Next.js app, which transpiles it. The compiled-package compiler options live in `packages/config-ts/library.json`; each package sets its own `rootDir`/`outDir` (TS resolves those relative to the file that declares them).

---

## 3. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Directories | `kebab-case` | `payment-reminders/` |
| React components (file + export) | `PascalCase` | `StudentTable.tsx` → `StudentTable` |
| Non-component TS files | `kebab-case` | `use-batch-query.ts`, `enrollment.service.ts` |
| NestJS files | `kebab-case.role.ts` | `students.controller.ts` |
| Zod schemas | `PascalCase` + `Schema` | `EnrollmentSchema` |
| Inferred types | `PascalCase`, no suffix | `type Enrollment = z.infer<typeof EnrollmentSchema>` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_BATCH_SIZE` |
| Env vars | `SCREAMING_SNAKE_CASE`, prefixed | `DATABASE_URL`, `NEXT_PUBLIC_POSTHOG_KEY` |
| Internal packages | `@moonit/<name>` | `@moonit/schema` |
| DB tables / columns | `snake_case`, plural tables | `enrollments`, `created_at` |
| BullMQ queues | `kebab-case` noun | `payment-reminder`, `ai-ingest` |
| Git branches | `type/short-desc` | `feat/student-bulk-import` |

**Drizzle ↔ TS boundary:** keep `snake_case` in the database; let Drizzle map to `camelCase` in TS via column config. Pick one mapping rule and never hand-write the other side.

---

## 4. The Schema → Type → Contract Pipeline

This is the spine of the codebase. Get it right and everything else follows.

```
packages/schema (Zod)
   ├── inferred TS types ──────────► used everywhere
   ├── OpenAPI doc (nestjs-zod) ► NestJS contract + Swagger UI
   ├── RHF resolver (@hookform/resolvers/zod) ► web forms
   └── runtime validation ─────────► API request/response, env, job payloads
```

The stack targets **Zod 4** — it has first-party JSON Schema export (`z.toJSONSchema()`) and a global registry (`.meta()` / `.describe()`) for OpenAPI metadata. Use **`nestjs-zod` v5** (`createZodDto`, `ZodValidationPipe`, `ZodSerializerInterceptor`, `@ZodResponse`, and the **required** `cleanupOpenApiDoc`): v5 is the line that consumes the project's own Zod 4 via `z.toJSONSchema()`. ⚠️ The npm `nestjs-zod@4.x` is **not** this line — it bundles its own Zod-3 fork (`@nest-zod/z`) and has no `cleanupOpenApiDoc`. Don't mix Zod majors across packages.

Rules:

- Define each domain entity once in `packages/schema`. Derive create/update variants with `.omit()` / `.partial()` / `.extend()` — never redeclare.
- The API validates **inbound** (always) and **outbound** (dev/test only — see §6) payloads against these schemas. OpenAPI is generated from them and stays on in all environments (contract-first stays honest because the contract and the validator are the same object).
- **The DB table is the one peer shape, not a third source.** `packages/schema` is upstream of `packages/db` (the dependency points `db → schema`), so Drizzle tables are authored *downstream* of Zod and can drift. Guard it at compile time: every table carries a type-level assertion that its inferred row conforms to the schema entity. `drizzle-zod` does **not** apply here — it generates Zod *from* Drizzle, the reverse of our dependency arrow.

  ```ts
  // packages/db/src/students/students.table.spec-d.ts
  import type { InferSelectModel } from "drizzle-orm";
  import type { Student } from "@moonit/schema";
  import { expectTypeOf } from "vitest";
  // fails to compile if the table and the wire schema drift
  expectTypeOf<InferSelectModel<typeof students>>().toEqualTypeOf<Student>();
  ```

- Prefer **plain** wire schemas (no `.transform()` / coercion) for entities, so a schema's input and output JSON Schemas coincide. When a transform is unavoidable, expose the response shape via `nestjs-zod`'s `.Output` / `@ZodResponse` so the contract reflects the *post*-transform shape.
- **`apps/web` consumes the contract by parsing, not codegen.** Fetchers in `apps/web/src/lib` run `EntitySchema.parse(await res.json())` for a runtime-validated, fully-typed result — leaning on the already-declared `web → @moonit/schema` edge. No generated client, no ts-rest. (`openapi-typescript` / ts-rest were considered and rejected: extra coupling and a build step a server-first Next.js app doesn't need here.)
- Web forms use the same schema as the API expects. A form that compiles cannot send a shape the server rejects.
- **BullMQ job payloads are Zod schemas too.** Validate on enqueue and on process — Redis is untyped and jobs outlive deploys.
- `packages/schema` has **zero runtime dependencies** beyond Zod. No Drizzle, no Nest, no React.

---

## 5. Configuration & Environment Management

### Single typed entry point per app

Every app loads env **once** through a Zod-validated module. The app crashes on boot if env is invalid — never lazily, never half-configured.

```ts
// apps/api/src/config/env.ts
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
});
export const env = EnvSchema.parse(process.env);
```

Rules:

- **Never read `process.env` directly** outside the env module. Lint-ban it.
- Web client vars must be `NEXT_PUBLIC_*` and validated in a separate client schema. Server secrets must never carry that prefix.
- Commit a `.env.example` with every key (empty or dummy values). Onboarding is `cp .env.example .env`.
- Secrets live in the platform's secret store (CI secrets, hosting env) — never in the repo, never in Turborepo remote cache inputs.
- `turbo.json` declares which env vars affect each task's cache key (`"env": [...]`) so cache invalidation is correct.

### Config ownership

| Config | Lives in | Shared via |
|---|---|---|
| `tsconfig` | `packages/config-ts/base.json` | each pkg `extends` it |
| Biome | root `biome.json` | single root config (no separate package); replaces ESLint + Prettier |
| Tailwind | `packages/ui` exports a preset | apps import the preset |
| Drizzle | `packages/db/drizzle.config.ts` | API consumes the client |

---

## 6. Code Organization Patterns

### Backend (NestJS)

- **Controller → Service → Repository.** Controllers do HTTP + validation only. Services hold business logic. Repositories hold all Drizzle queries. No query strings leak above the repository.
- **Validation & OpenAPI via `nestjs-zod`** — three distinct mechanisms, one schema:
  - *Inbound:* a global `ZodValidationPipe` (`APP_PIPE`) validates `@Body()` / `@Query()` / `@Param()` against `packages/schema`.
  - *Outbound:* `ZodSerializerInterceptor` (`APP_INTERCEPTOR`) + `@ZodResponse({ type })` serializes and validates responses. Register the interceptor **only when `env.NODE_ENV !== "production"`** — it catches contract drift in dev/CI without paying per-response CPU on hot list endpoints in prod.
  - *OpenAPI:* generated from the same Zod objects through `@nestjs/swagger`, wrapped in the **required** `cleanupOpenApiDoc(doc)` before `SwaggerModule.setup(...)`. Generation runs in all environments.
  - No `class-validator` DTOs — the validator and the published contract stay one object.
- **DI everywhere.** Inject the Drizzle client, Redis connection, and AI service as providers. This is what makes Testcontainers integration tests clean — swap the connection, not the code.
- **Cross-cutting concerns are interceptors/filters/guards**, not copy-pasted try/catch. One global exception filter maps domain errors → HTTP + Sentry. One logging interceptor wires Pino request context.
- **Transactions are explicit.** Multi-write operations (enrollment + payment) run in a Drizzle transaction at the service layer.

### Frontend (Next.js)

- **Server-first.** Default to RSC for data display. Reach for `"use client"` only at the leaf that needs interactivity, state, or browser APIs.
- **Mutations through Server Actions**, validated with the shared Zod schema, then `revalidatePath`/`revalidateTag`.
- **Typed reads by parsing, not codegen.** Fetchers in `lib/` parse API responses with the shared schema (`EntitySchema.parse(...)`) — runtime-validated and fully typed off the `web → @moonit/schema` edge. No generated API client.
- **State boundaries are sharp:**
  - *Server state* → TanStack Query (or RSC fetch). Never mirror server data into Zustand.
  - *Client UI state* (sidebars, modals, wizards) → Zustand, kept small.
  - *URL state* (filters, pagination, sort on TanStack Tables) → nuqs, so views are shareable and back-button-correct.
- **Forms** = React Hook Form + Zod resolver + shadcn/ui field components. One pattern, repo-wide.

### The `ai` package

- Expose a transport-agnostic core: `ingest(docs)`, `retrieve(query)`, `chat(messages, tools)`. Streaming is returned as a stream the caller adapts.
- Tools (`checkBatchAvailability`, `createEnrollmentLead`) are defined with Zod input schemas and call into domain services through injected interfaces — the `ai` package does not import the API's modules directly.
- Embeddings → pgvector through `packages/db`. The vector store is just another repository.
- Conversation state persists in Postgres so a Messenger thread survives restarts and can be resumed.

### Shared errors & results

`packages/core` exports a small set of tagged domain errors and a `Result` type. Domain logic returns typed failures; the HTTP/transport edge decides status codes. This keeps "not found" and "forbidden" out of `throw new Error("...")` string-matching.

---

## 7. Database & Migrations

- **Drizzle migrations are committed SQL**, generated via `drizzle-kit generate`, applied via `drizzle-kit migrate`. Never push schema changes straight to a shared DB with `push` outside local dev.
- Migrations are **forward-only and reviewed**. One migration per PR where possible; name them meaningfully.
- **pgvector** is enabled via an init migration (`CREATE EXTENSION IF NOT EXISTS vector`). Embedding dimension is a constant in `packages/schema`, referenced by both the column definition and the embedding call so they can never drift.
- **Every table conforms to its schema entity at compile time.** A `*.spec-d.ts` type assertion (`expectTypeOf<InferSelectModel<typeof table>>().toEqualTypeOf<Entity>()`) fails the typecheck if the Drizzle table and the `@moonit/schema` entity drift. This is the same no-drift instinct as the pgvector dimension constant, applied to whole rows (see §4).
- Seed data lives in `packages/db/seed.ts`, idempotent, for local + test only.
- Index deliberately: foreign keys, `created_at` for time-range dashboards, and an HNSW/IVFFlat index on the embedding column.

---

## 8. Background Jobs (BullMQ)

- One queue per concern (`payment-reminder`, `messenger-inbound`, `ai-ingest`). Processors live in `apps/api/src/jobs/`.
- **Every job payload is Zod-validated** on enqueue and on process.
- Configure retries with backoff, `removeOnComplete` bounds, and a dead-letter strategy for poison messages. Idempotency keys on anything that sends money reminders or external messages — a job may run twice.
- Schedulers (repeatable jobs) are declared in code at boot, not configured ad hoc.

---

## 9. Auth & Authorization

- **Better Auth**, self-hosted, sessions in Postgres/Redis.
- Roles (`admin` / `staff` / `instructor`) are an enum in `packages/auth`, shared by the NestJS guard and the Next.js middleware so the two never disagree.
- Authorization is enforced **server-side on every mutation** (Server Action + API guard). Client-side role checks are UX only, never a security boundary.
- Secrets (`BETTER_AUTH_SECRET`) are required env, min length enforced by the env schema.

---

## 10. Testing Strategy

| Layer | Tool | What it covers |
|---|---|---|
| Unit | Vitest | pure logic, services with mocked repos, Zod schemas |
| Integration | Vitest + **Testcontainers** | repositories + jobs against real Postgres/Redis |
| E2E | Playwright | critical admin flows: enroll a student, record a payment, chat widget |

- Integration tests spin up **real** Postgres + Redis via Testcontainers — no mocking the database. This is the senior signal and catches migration/query bugs mocks hide.
- Co-locate unit tests next to source (`*.spec.ts`). Keep E2E in `apps/web/e2e/`.
- Coverage runs in CI; the badge in the README reflects the main-branch number.
- Test data builders, not giant fixtures — `makeStudent({ overrides })`.

---

## 11. Observability

- **Pino** structured JSON logs with a request-scoped correlation ID propagated through jobs and AI calls. No `console.log` in committed code (lint-ban it).
- **Sentry** for errors on both apps, sourcemaps uploaded in CI, releases tagged with the commit SHA.
- **OpenTelemetry** traces spanning HTTP → service → DB → BullMQ → AI provider, so a slow chatbot reply is debuggable end to end.
- **PostHog** for product analytics; events named `noun_verb` (`enrollment_created`), defined in one `analytics.ts` so names don't sprawl.

---

## 12. CI/CD & Caching

GitHub Actions pipeline, every PR:

```
install → biome check → typecheck → test (unit + integration) → build
```

- **Turborepo remote caching** keyed on real inputs; CI restores it so unchanged packages don't rebuild.
- The `build` step compiles every internal package to `dist` (and `apps/api` to `dist` via SWC), so CI verifies a **runnable artifact**, not just types. Build outputs are cached per package, and `typecheck`/`test` depend on `^build`.
- Run only what changed: `turbo run ... --filter=...[origin/main]` on PRs.
- Integration tests get Postgres/Redis as CI service containers (or Testcontainers if the runner allows Docker).
- **Preview deploy per PR** for `apps/web`; the API gets an ephemeral environment or is mocked, depending on cost.
- Merges to `main` are squash-only; the squashed message must pass commitlint.

---

## 13. Commit & Versioning Hygiene

- **Conventional Commits**, enforced by commitlint on every commit (Husky `commit-msg` hook).
- **lint-staged** runs Biome on staged files in the `pre-commit` hook — fast, only touched files.
- **Changesets** version internal packages. Any PR that changes a published package's behavior includes a changeset; CI fails if one is missing.
- Branch naming: `feat/`, `fix/`, `chore/`, `refactor/`, `docs/` + kebab description.

---

## 14. Definition of "Done" for a PR

A change is mergeable when:

1. Types compile under strict mode, no new `any`.
2. Biome passes, no lint suppressions added without a comment explaining why.
3. New logic has tests at the appropriate layer; integration tests pass against real Postgres/Redis.
4. Any schema change has a Drizzle migration **and** the corresponding `packages/schema` update, with the table↔entity type assertion (§4, §7) still green.
5. Env additions are in `.env.example`, the env Zod schema, and `turbo.json` cache inputs.
6. A changeset exists if a package's public behavior changed.
7. The commit/PR title passes commitlint.

---

## 15. Anti-Patterns — Don't

- ❌ Import from `apps/*` inside `packages/*`.
- ❌ Read `process.env` outside the typed env module.
- ❌ Write Drizzle queries outside a repository.
- ❌ Duplicate a type that Zod can infer.
- ❌ Mirror server state into Zustand.
- ❌ Put business logic in a controller or a Server Action body.
- ❌ Mock the database in integration tests.
- ❌ Ship a schema change without a migration.
- ❌ Trust a client-side role check as a security boundary.
- ❌ Pull the AI provider or DB driver into a client bundle.