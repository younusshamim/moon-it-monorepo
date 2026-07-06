// Domain 7 — Enrollment & Attendance. Peer of @moonit/schema/enrollment.
import { sql } from "drizzle-orm";
import { date, index, pgEnum, pgTable, unique, uuid } from "drizzle-orm/pg-core";
import { students } from "./people.js";
// `batches` is referenced lazily; imported from scheduling.
import { batches, sessions } from "./scheduling.js";
import { audit, id, isoTimestamp, timestamps } from "./shared.js";

export const enrollmentStatus = pgEnum("enrollment_status", [
  "applied",
  "confirmed",
  "active",
  "completed",
  "dropped",
  "transferred",
]);

export const enrollments = pgTable(
  "enrollments",
  {
    id: id(),
    studentId: uuid()
      .references(() => students.id)
      .notNull(),
    batchId: uuid()
      .references(() => batches.id)
      .notNull(),
    status: enrollmentStatus().default("applied").notNull(),
    enrolledAt: date(),
    completedAt: date(),
    ...timestamps(),
    ...audit(),
  },
  (t) => [
    unique().on(t.studentId, t.batchId), // no double-enroll
    index().on(t.studentId),
    index().on(t.batchId),
    index().on(t.createdAt),
  ],
);

export const attendanceStatus = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "excused",
]);

export const attendance = pgTable(
  "attendance",
  {
    id: id(),
    sessionId: uuid()
      .references(() => sessions.id)
      .notNull(),
    enrollmentId: uuid()
      .references(() => enrollments.id)
      .notNull(),
    status: attendanceStatus().default("present").notNull(),
    markedAt: isoTimestamp().default(sql`now()`).notNull(),
    markedBy: uuid(),
  },
  (t) => [
    unique().on(t.sessionId, t.enrollmentId),
    index().on(t.sessionId),
    index().on(t.enrollmentId),
  ],
);
