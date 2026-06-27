// Domain 10 — Admissions / CRM: leads and lead activity. Peer of @moonit/schema/crm.
import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { courses } from "./catalog.js";
import { branches } from "./organization.js";
import { audit, id, timestamps } from "./shared.js";

export const leadStatus = pgEnum("lead_status", [
  "new",
  "contacted",
  "interested",
  "enrolled",
  "lost",
]);
export const leadSource = pgEnum("lead_source", [
  "walk_in",
  "facebook",
  "google",
  "referral",
  "phone",
  "website",
]);

export const leads = pgTable(
  "leads",
  {
    id: id(),
    branchId: uuid()
      .references(() => branches.id)
      .notNull(),
    fullName: varchar({ length: 160 }).notNull(),
    phone: varchar({ length: 32 }).notNull(),
    email: varchar({ length: 160 }),
    interestedCourseId: uuid().references(() => courses.id),
    source: leadSource().default("walk_in").notNull(),
    status: leadStatus().default("new").notNull(),
    assignedTo: uuid(),
    notes: text(),
    ...timestamps(),
    ...audit(),
  },
  (t) => [index().on(t.branchId), index().on(t.interestedCourseId), index().on(t.createdAt)],
);

export const leadActivities = pgTable(
  "lead_activities",
  {
    id: id(),
    leadId: uuid()
      .references(() => leads.id)
      .notNull(),
    type: varchar({ length: 40 }).notNull(), // "call", "visit", "follow_up"
    note: text(),
    activityAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
    by: uuid(),
  },
  (t) => [index().on(t.leadId)],
);
