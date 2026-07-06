// Domain 4 — Scheduling: batches, weekly schedules, sessions, instructor assignment. Peer of
// @moonit/schema/scheduling.
import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  time,
  uniqueIndex,
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
    code: varchar({ length: 32 }).notNull(), // "WEB-101-B07"
    name: varchar({ length: 120 }),
    status: batchStatus().default("planned").notNull(),
    startDate: date(),
    endDate: date(),
    capacity: integer().notNull(),
    // Denormalized. Recompute — never increment/decrement — inside the same transaction as any
    // `enrollments` insert / status-change / delete:
    //   UPDATE batches SET enrolled_count = (
    //     SELECT count(*) FROM enrollments
    //     WHERE batch_id = $1 AND status IN ('confirmed', 'active', 'completed')
    //   ) WHERE id = $1;
    // Recompute-in-transaction is self-healing against races/bugs; incremental ±1 math is not.
    enrolledCount: integer().default(0).notNull(),
    feeOverride: numeric({ precision: 12, scale: 2 }), // per-batch promo pricing
    defaultRoomId: uuid().references(() => rooms.id),
    ...timestamps(),
  },
  (t) => [
    // A mistakenly-created-then-soft-deleted batch shouldn't permanently block reusing its code.
    uniqueIndex("batches_code_live_uq").on(t.code).where(sql`${t.deletedAt} IS NULL`),
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
