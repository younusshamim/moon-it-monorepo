// Shared Drizzle column primitives — the DB-side peers of @moonit/schema's shared/columns.
// Column *names* are derived from the camelCase keys via `casing: "snake_case"` (set on both the
// client and drizzle-kit), so we never hand-write the snake_case side (INFRASTRUCTURE.md §3).
//
// These are **factories**: each call returns fresh builders. Reusing a single builder instance
// across tables degrades Drizzle's per-table type inference (every column widens to `| undefined`)
// under `exactOptionalPropertyTypes`, so we never share instances.
//
// Type alignment with the wire contract (so the §4 drift assertions hold):
//   - `isoTimestamp` (below) infers `string` and reads back as RFC-3339 — matches schema's
//     ISO-string decision, and the Zod peer no longer needs a normalizing preprocess.
//   - `numeric` / `date` / `time` already infer `string` in their default modes.
import { sql } from "drizzle-orm";
import { customType, uuid } from "drizzle-orm/pg-core";

/** Primary key — `uuid` with DB-side random default. */
export const id = () => uuid().primaryKey().defaultRandom();

/**
 * `timestamptz` that always reads back as canonical RFC-3339 (`2026-07-04T06:43:44.123Z`).
 *
 * Drizzle's built-in `timestamp({ mode: "string" })` passes Postgres' text form through untouched
 * (`2026-07-04 06:43:44+00` — space separator, `+00` offset), which is NOT RFC-3339 and used to
 * fail `z.iso.datetime()`, causing API-wide 500s. Normalizing here at the driver boundary (rather
 * than in the Zod layer) means every reader — API, seed, scripts, future workers — gets the same
 * ISO-8601 string, identical in dev and prod (the old fix lived in a serializer that is off in
 * prod). `toDriver` also accepts a `Date`, so Better Auth can write its `Date` values straight to
 * `users` — which is what makes the old `user-date-shim` Proxy deletable.
 *
 * The emitted DDL is plain `timestamp with time zone` (unchanged), so this produces no migration.
 *
 * Caveat: `toISOString()` is millisecond-precision while Postgres stores microseconds, so never do
 * an equality comparison (`WHERE created_at = $roundTrippedValue`) on a value read back through
 * this type. The repositories only ever compare ids/FKs, so this is safe today.
 */
export const isoTimestamp = customType<{ data: string; driverData: string | Date }>({
  dataType: () => "timestamp with time zone",
  fromDriver: (value) => new Date(value).toISOString(),
  toDriver: (value: string | Date) => (typeof value === "string" ? value : value.toISOString()),
});

/** `created_at` / `updated_at` / `deleted_at` — peer of schema's `timestamps`. */
export const timestamps = () => ({
  createdAt: isoTimestamp().default(sql`now()`).notNull(),
  updatedAt: isoTimestamp()
    .default(sql`now()`)
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
  deletedAt: isoTimestamp(),
});

/** `created_by` / `updated_by` — peer of schema's `audit`. */
export const audit = () => ({
  createdBy: uuid(),
  updatedBy: uuid(),
});
