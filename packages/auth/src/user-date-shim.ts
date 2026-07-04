// Better Auth works in JS `Date`s for date fields, but `iam.users` uses drizzle `mode: "string"`
// timestamps — the shared ISO-string wire contract (@moonit/db shared.ts, honoured by the API + the
// §4 drift assertions). Postgres.js can't encode a `Date` param for a string-mode column, so writes
// Better Auth makes to `users` (its `createdAt`/`updatedAt`) blow up. This shim wraps the Drizzle
// client and coerces `Date` → ISO string on `insert(...).values()` / `update(...).set()` for the
// `users` table only. Reads convert back: the Drizzle adapter's own `customTransformOutput` maps the
// ISO string to `new Date(...)`. The `auth_*` infra tables use drizzle `mode: "date"` (see auth.ts),
// so they need no shim, and `users` is never filtered by a date value, so writes are the whole story.
import type { Database } from "@moonit/db";
import { users } from "@moonit/db";

type Row = Record<string, unknown>;

function isoDates(row: Row): Row {
  const out: Row = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}

type InsertBuilder = { values: (data: Row | Row[]) => unknown };
type UpdateBuilder = { set: (data: Row) => unknown };

/** Wrap a Drizzle client so Better Auth's `Date`s land in `iam.users`'s string-mode columns as ISO. */
export function withUserDateShim(db: Database): Database {
  return new Proxy(db, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;

      if (prop === "insert") {
        return (table: unknown) => {
          const builder = (value as (t: unknown) => InsertBuilder).call(target, table);
          if (table !== users) return builder;
          const original = builder.values.bind(builder);
          builder.values = (data) =>
            original(Array.isArray(data) ? data.map(isoDates) : isoDates(data));
          return builder;
        };
      }

      if (prop === "update") {
        return (table: unknown) => {
          const builder = (value as (t: unknown) => UpdateBuilder).call(target, table);
          if (table !== users) return builder;
          const original = builder.set.bind(builder);
          builder.set = (data) => original(isoDates(data));
          return builder;
        };
      }

      return (value as (...args: unknown[]) => unknown).bind(target);
    },
  }) as Database;
}
