// Shared column primitives for every @moonit/schema entity.
//
// These mirror the Drizzle `shared/columns.ts` fragments in DATABASE_DOMAIN.md, but Zod is the
// *authored* source (INFRASTRUCTURE.md §4): packages/db is built downstream and must conform.
//
// Wire-representation decisions (confirmed):
//   - Postgres `numeric(p,s)` (money, fees, marks, rates) → decimal **string** — matches Drizzle's
//     default numeric mode and avoids float drift. Use `numericString()`.
//   - `date` / `timestamp(tz)` / `time` → **ISO strings**. `timestamptz` is normalized to canonical
//     RFC-3339 by packages/db's `isoTimestamp` custom type; `date`/`time` use Drizzle string mode.
//     Keeps wire schemas plain JSON: a schema's input and output JSON Schema coincide (no
//     `.transform()` / coercion), per §4.
import { z } from "zod";

/** Primary key — `uuid` with DB-side `defaultRandom()`. */
export const id = z.uuid();

/**
 * Postgres `numeric(precision, scale)` rendered as a canonical decimal string (e.g. `"1500.00"`).
 * Drizzle returns `numeric` columns as `string` in its default mode, so the wire contract matches
 * the DB row without coercion.
 */
export const numericString = () =>
  z
    .string()
    .regex(/^-?\d+(\.\d+)?$/, "Expected a decimal numeric string")
    .meta({ description: "Decimal value serialized as a string (Postgres numeric)." });

/** ISO calendar date, `YYYY-MM-DD` (Postgres `date`). */
export const isoDate = () => z.iso.date();

/**
 * ISO timestamp with timezone offset (Postgres `timestamptz`).
 *
 * The DB layer's `isoTimestamp` custom type (@moonit/db `schema/shared.ts`) normalizes Postgres'
 * text form to canonical RFC-3339 at the driver boundary, so the wire value is already valid ISO
 * here — no `z.preprocess` needed. This keeps the invariant that a wire schema's input and output
 * JSON Schema coincide (no `.transform()` / coercion).
 */
export const isoDateTime = () => z.iso.datetime({ offset: true });

/** ISO wall-clock time, `HH:MM:SS` (Postgres `time`). */
export const isoTime = () => z.iso.time();

/**
 * Audit timestamps carried by every entity that uses `...timestamps`.
 * `createdAt`/`updatedAt` are `defaultNow().notNull()`; `deletedAt` is the soft-delete marker.
 */
export const timestamps = {
  createdAt: isoDateTime(),
  updatedAt: isoDateTime(),
  deletedAt: isoDateTime().nullable(),
};

/** The columns omitted from create schemas: server-managed identity, soft delete, and audit. */
export const TIMESTAMP_KEYS = {
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

/** Actor columns carried by entities that use `...audit`. */
export const audit = {
  createdBy: z.uuid().nullable(),
  updatedBy: z.uuid().nullable(),
};

export const AUDIT_KEYS = {
  createdBy: true,
  updatedBy: true,
} as const;
