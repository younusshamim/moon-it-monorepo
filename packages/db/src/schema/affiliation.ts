// Domain 6 — Affiliation: bodies, exam fees, exam events, registrations. Peer of
// @moonit/schema/affiliation.
import {
  boolean,
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { courses } from "./catalog.js";
import { enrollments } from "./enrollment.js";
import { branches } from "./organization.js";
import { students } from "./people.js";
import { audit, id, timestamps } from "./shared.js";

export const affiliationBodies = pgTable(
  "affiliation_bodies",
  {
    id: id(),
    code: varchar({ length: 24 }).notNull().unique(), // "BTEB", "NSDA"
    name: varchar({ length: 200 }).notNull(),
    website: varchar({ length: 240 }),
    isActive: boolean().default(true).notNull(),
    ...timestamps(),
  },
  (t) => [index().on(t.createdAt)],
);

export const govtExamFees = pgTable(
  "govt_exam_fees",
  {
    id: id(),
    courseId: uuid()
      .references(() => courses.id)
      .notNull(),
    branchId: uuid().references(() => branches.id), // null = applies institute-wide
    registrationFee: numeric({ precision: 12, scale: 2 }).notNull(),
    currency: varchar({ length: 3 }).default("BDT").notNull(),
    validFrom: date(),
    validTo: date(),
    isActive: boolean().default(true).notNull(),
    ...timestamps(),
  },
  (t) => [
    unique().on(t.courseId, t.branchId),
    index().on(t.courseId),
    index().on(t.branchId),
    index().on(t.createdAt),
  ],
);

export const govtExamEvents = pgTable(
  "govt_exam_events",
  {
    id: id(),
    affiliationBodyId: uuid()
      .references(() => affiliationBodies.id)
      .notNull(),
    courseId: uuid()
      .references(() => courses.id)
      .notNull(),
    title: varchar({ length: 200 }).notNull(), // "BTEB Web Design — June 2026"
    examDate: date(),
    registrationOpensAt: date(),
    registrationClosesAt: date(),
    resultPublishedAt: date(),
    ...timestamps(),
  },
  (t) => [index().on(t.affiliationBodyId), index().on(t.courseId), index().on(t.createdAt)],
);

export const govtRegStatus = pgEnum("govt_reg_status", [
  "pending_payment",
  "registered",
  "admit_issued",
  "appeared",
  "passed",
  "failed",
  "absent",
  "cancelled",
]);

export const govtExamRegistrations = pgTable(
  "govt_exam_registrations",
  {
    id: id(),
    studentId: uuid()
      .references(() => students.id)
      .notNull(),
    enrollmentId: uuid().references(() => enrollments.id), // usually tied to their batch
    examEventId: uuid()
      .references(() => govtExamEvents.id)
      .notNull(),
    branchId: uuid()
      .references(() => branches.id)
      .notNull(),
    status: govtRegStatus().default("pending_payment").notNull(),
    boardRollNumber: varchar({ length: 48 }), // assigned by the body
    boardRegistrationNumber: varchar({ length: 48 }),
    resultGrade: varchar({ length: 16 }),
    resultMarks: numeric({ precision: 6, scale: 2 }),
    registeredAt: date(),
    ...timestamps(),
    ...audit(),
  },
  (t) => [
    unique().on(t.studentId, t.examEventId),
    index().on(t.studentId),
    index().on(t.enrollmentId),
    index().on(t.examEventId),
    index().on(t.branchId),
    index().on(t.createdAt),
  ],
);
