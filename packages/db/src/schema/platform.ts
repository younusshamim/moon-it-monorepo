// Domain 11 — Communication & platform audit: notifications, audit log. Peer of
// @moonit/schema/platform. These carry loose actor/branch uuids (no FKs) by design: the append-only
// audit trail must survive row deletes elsewhere.
import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, isoTimestamp, timestamps } from "./shared.js";

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    recipientUserId: uuid(),
    channel: varchar({ length: 16 }).notNull(), // "sms", "email", "in_app"
    title: varchar({ length: 200 }),
    body: text(),
    readAt: isoTimestamp(),
    sentAt: isoTimestamp().default(sql`now()`).notNull(),
  },
  (t) => [index().on(t.recipientUserId), index().on(t.sentAt)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    actorUserId: uuid(),
    branchId: uuid(),
    action: varchar({ length: 80 }).notNull(), // "invoice.void"
    entityType: varchar({ length: 60 }).notNull(),
    entityId: uuid(),
    before: jsonb().$type<Record<string, unknown>>(),
    after: jsonb().$type<Record<string, unknown>>(),
    ...timestamps(),
  },
  (t) => [
    index().on(t.actorUserId),
    index().on(t.branchId),
    index().on(t.entityType),
    index().on(t.createdAt),
  ],
);
