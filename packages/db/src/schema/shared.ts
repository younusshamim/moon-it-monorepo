// Shared Drizzle column primitives — the DB-side peers of @moonit/schema's shared/columns.
// Column *names* are derived from the camelCase keys via `casing: "snake_case"` (set on both the
// client and drizzle-kit), so we never hand-write the snake_case side (INFRASTRUCTURE.md §3).
//
// These are **factories**: each call returns fresh builders. Reusing a single builder instance
// across tables degrades Drizzle's per-table type inference (every column widens to `| undefined`)
// under `exactOptionalPropertyTypes`, so we never share instances.
//
// Type alignment with the wire contract (so the §4 drift assertions hold):
//   - `timestamp(..., { mode: "string" })` infers `string` — matches schema's ISO-string decision.
//   - `numeric` / `date` / `time` already infer `string` in their default modes.
import { timestamp, uuid } from "drizzle-orm/pg-core";

/** Primary key — `uuid` with DB-side random default. */
export const id = () => uuid().primaryKey().defaultRandom();

const tstz = () => timestamp({ withTimezone: true, mode: "string" });

/** `created_at` / `updated_at` / `deleted_at` — peer of schema's `timestamps`. */
export const timestamps = () => ({
  createdAt: tstz().defaultNow().notNull(),
  updatedAt: tstz()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
  deletedAt: tstz(),
});

/** `created_by` / `updated_by` — peer of schema's `audit`. */
export const audit = () => ({
  createdBy: uuid(),
  updatedBy: uuid(),
});
