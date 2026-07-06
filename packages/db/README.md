# @moonit/db

The Drizzle schema, migrations, and injectable client for the platform. One schema file per
bounded context (`iam`, `organization`, `catalog`, `scheduling`, `enrollment`, `finance`,
`assessment`, `affiliation`, `hr`, `people`, `auth`, `crm`, `platform`), mirroring
`@moonit/schema`'s domains — see [`packages/db/src/type-drift.ts`](./src/type-drift.ts) for how the
two are kept in sync.

## Scripts

| Script            | Purpose                                                              |
| ----------------- | --------------------------------------------------------------------- |
| `build`           | Compile to `dist` (`tsc`)                                            |
| `dev`             | `tsc --watch`                                                        |
| `typecheck`       | `tsc --noEmit`                                                        |
| `db:generate`     | Diff the schema against the migrations journal and emit a new SQL migration |
| `db:migrate`      | Apply pending migrations to the target database                      |
| `db:push:local`   | Push schema changes directly, no migration file — **local only**, see below |
| `db:studio`       | Launch Drizzle Studio against the target database                    |
| `db:seed`         | Run the idempotent seed (`src/seed.ts`)                               |
| `db:dbml`         | Generate a DBML diagram from the schema                               |

## Migration policy

**Generated migrations (`db:generate` + `db:migrate`) are the only path to a shared, staging, or
production database.** `db:push:local` (`drizzle-kit push`) diffs and applies the schema directly
with no migration file — it is for local, throwaway iteration only, and must never be run against a
database anyone else depends on.

Hand-written migrations are allowed for statements `drizzle-kit generate` can't produce on its own
(e.g. `migrations/0000_enable_extensions.sql` for `CREATE EXTENSION vector`). Add them via
`drizzle-kit generate --custom` or by hand-following the existing `migrations/meta/_journal.json`
format — never by editing a migration that has already been applied anywhere.

The programmatic `runMigrations` export in [`src/migrate.ts`](./src/migrate.ts) exists for
Testcontainers-backed integration tests and other code paths that need to apply migrations without
the CLI.

See [`docs/architecture-review/04-database-drizzle.md`](../../docs/architecture-review/04-database-drizzle.md)
for the full rationale behind these conventions.
