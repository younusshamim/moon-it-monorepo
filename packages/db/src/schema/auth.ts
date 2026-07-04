// Better Auth infrastructure tables (auth sessions, accounts, verifications). The `user` model maps
// onto `iam.users`; these three are Better Auth's own tables, authored here so drizzle-kit owns the
// migrations. Field *keys* stay camelCase to match Better Auth's expected field names; the physical
// snake_case column names are derived via `casing: "snake_case"`. Credential password hashes live in
// `auth_accounts.password` — never on the user row. See @moonit/auth `createAuth`.
//
// NOTE: tables are named `auth_*` because the scheduling domain already owns a `sessions` table
// (class sessions). Better Auth references these via explicit schema mapping in `createAuth`, so the
// physical names are free to be prefixed.
import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./iam.js";
import { id } from "./shared.js";

// `mode: "date"` (drizzle's pg default) — unlike the rest of the schema these tables are written and
// read *only* by Better Auth, which works in JS `Date`s (inserts, and `expiresAt` </> `new Date()`
// filters). Date mode lets drizzle serialize those directly; the physical column type is unchanged
// (no migration). The `iam.users` peer stays `mode: "string"` for the wire contract — @moonit/auth
// coerces Better Auth's `Date`s to ISO strings on user writes (see `withUserDateShim`).
const tstz = () => timestamp({ withTimezone: true });

// Non-soft-deletable infra rows: explicit created/updated (no `deletedAt` from the shared factory).
const authTimestamps = () => ({
  createdAt: tstz().defaultNow().notNull(),
  updatedAt: tstz()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: id(),
    userId: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    token: varchar({ length: 255 }).notNull().unique(),
    expiresAt: tstz().notNull(),
    ipAddress: varchar({ length: 64 }),
    userAgent: text(),
    ...authTimestamps(),
  },
  (t) => [index().on(t.userId)],
);

export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: id(),
    userId: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    accountId: varchar({ length: 255 }).notNull(),
    providerId: varchar({ length: 64 }).notNull(), // "credential" for email/password
    password: text(), // hashed credential secret
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: tstz(),
    refreshTokenExpiresAt: tstz(),
    scope: text(),
    ...authTimestamps(),
  },
  (t) => [index().on(t.userId)],
);

export const authVerifications = pgTable(
  "auth_verifications",
  {
    id: id(),
    identifier: varchar({ length: 255 }).notNull(),
    value: text().notNull(),
    expiresAt: tstz().notNull(),
    ...authTimestamps(),
  },
  (t) => [index().on(t.identifier)],
);
