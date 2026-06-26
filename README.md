# moon-it-monorepo

![coverage](https://img.shields.io/badge/coverage-pending-lightgrey)

A type-safe, Zod-first Turborepo for the Moon IT admin platform: a Next.js 16 web app and a NestJS + Fastify API, sharing schemas, database, auth, AI, and UI through internal `@moonit/*` packages. A single Zod schema flows from database to API to client, so a type or contract is defined once and validated everywhere. See [`INFRASTRUCTURE.md`](./INFRASTRUCTURE.md) for the architecture, conventions, and operating rules — it is the source of truth.

## Getting started

```bash
cp .env.example .env   # (env files arrive with the apps)
pnpm install
pnpm typecheck
```

## Layout

- `apps/*` — deployable units (`web`, `api`). Thin wiring only.
- `packages/*` — shared logic (`schema`, `db`, `ai`, `auth`, `ui`, `core`, `config-ts`).
- `tooling/*` — infra glue (`docker`, `scripts`); not a workspace package.
