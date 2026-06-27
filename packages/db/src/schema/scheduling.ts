// Domain 4 — Scheduling: batches, weekly schedules, sessions, instructor assignment. Peer of
// @moonit/schema/scheduling.
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  time,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { courseOfferings } from "./catalog.js";
import { instructors } from "./hr.js";
import { branches, rooms } from "./organization.js";
import { id, timestamps } from "./shared.js";

export const batchStatus = pgEnum("batch_status", [
  "planned",
  "open_for_enrollment",
  "running",
  "completed",
  "cancelled",
]);

export const batches = pgTable(
  "batches",
  {
    id: id(),
    offeringId: uuid()
      .references(() => courseOfferings.id)
      .notNull(),
    branchId: uuid()
      .references(() => branches.id)
      .notNull(),
    code: varchar({ length: 32 }).notNull().unique(), // "WEB-101-B07"
    name: varchar({ length: 120 }),
    status: batchStatus().default("planned").notNull(),
    startDate: date(),
    endDate: date(),
    capacity: integer().notNull(),
    enrolledCount: integer().default(0).notNull(), // denormalized counter
    feeOverride: numeric({ precision: 12, scale: 2 }), // per-batch promo pricing
    defaultRoomId: uuid().references(() => rooms.id),
    ...timestamps(),
  },
  (t) => [
    index().on(t.offeringId),
    index().on(t.branchId),
    index().on(t.defaultRoomId),
    index().on(t.createdAt),
  ],
);

export const batchSchedules = pgTable(
  "batch_schedules",
  {
    id: id(),
    batchId: uuid()
      .references(() => batches.id)
      .notNull(),
    dayOfWeek: integer().notNull(), // 0 = Sun .. 6 = Sat
    startTime: time().notNull(),
    endTime: time().notNull(),
    roomId: uuid().references(() => rooms.id),
  },
  (t) => [index().on(t.batchId), index().on(t.roomId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    batchId: uuid()
      .references(() => batches.id)
      .notNull(),
    instructorId: uuid().references(() => instructors.id),
    roomId: uuid().references(() => rooms.id),
    sessionDate: date().notNull(),
    startTime: time().notNull(),
    endTime: time().notNull(),
    topic: varchar({ length: 200 }),
    isCancelled: boolean().default(false).notNull(),
    ...timestamps(),
  },
  (t) => [
    index().on(t.batchId),
    index().on(t.instructorId),
    index().on(t.roomId),
    index().on(t.sessionDate),
    index().on(t.createdAt),
  ],
);

export const batchInstructors = pgTable(
  "batch_instructors",
  {
    id: id(),
    batchId: uuid()
      .references(() => batches.id)
      .notNull(),
    instructorId: uuid()
      .references(() => instructors.id)
      .notNull(),
    isLead: boolean().default(false).notNull(),
  },
  (t) => [index().on(t.batchId), index().on(t.instructorId)],
);
