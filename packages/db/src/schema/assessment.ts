// Domain 8 (Assessment) — exams, grades, certificates. Peer of @moonit/schema/assessment.
import { date, index, numeric, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { affiliationBodies, govtExamRegistrations } from "./affiliation.js";
import { courses } from "./catalog.js";
import { enrollments } from "./enrollment.js";
import { batches } from "./scheduling.js";
import { id, timestamps } from "./shared.js";

export const examType = pgEnum("exam_type", [
  "quiz",
  "midterm",
  "final",
  "practical",
  "assignment",
]);
export const certificateSource = pgEnum("certificate_source", ["institute", "government"]);

export const exams = pgTable(
  "exams",
  {
    id: id(),
    batchId: uuid()
      .references(() => batches.id)
      .notNull(),
    type: examType().notNull(),
    title: varchar({ length: 160 }).notNull(),
    totalMarks: numeric({ precision: 6, scale: 2 }).notNull(),
    passMarks: numeric({ precision: 6, scale: 2 }).notNull(),
    weight: numeric({ precision: 5, scale: 2 }).default("1").notNull(), // for final grade calc
    examDate: date(),
    ...timestamps(),
  },
  (t) => [index().on(t.batchId), index().on(t.createdAt)],
);

export const grades = pgTable(
  "grades",
  {
    id: id(),
    examId: uuid()
      .references(() => exams.id)
      .notNull(),
    enrollmentId: uuid()
      .references(() => enrollments.id)
      .notNull(),
    marksObtained: numeric({ precision: 6, scale: 2 }),
    letterGrade: varchar({ length: 4 }),
    remarks: varchar({ length: 200 }),
    ...timestamps(),
  },
  (t) => [index().on(t.examId), index().on(t.enrollmentId), index().on(t.createdAt)],
);

export const certificates = pgTable(
  "certificates",
  {
    id: id(),
    enrollmentId: uuid()
      .references(() => enrollments.id)
      .notNull(),
    courseId: uuid()
      .references(() => courses.id)
      .notNull(),
    source: certificateSource().default("institute").notNull(),
    govtRegistrationId: uuid().references(() => govtExamRegistrations.id), // when source = government
    affiliationBodyId: uuid().references(() => affiliationBodies.id),
    certificateNumber: varchar({ length: 40 }).notNull().unique(),
    issuedAt: date().notNull(),
    finalGrade: varchar({ length: 8 }),
    verificationCode: varchar({ length: 64 }).unique(), // public QR verify
    pdfUrl: varchar({ length: 400 }),
    ...timestamps(),
  },
  (t) => [
    index().on(t.enrollmentId),
    index().on(t.courseId),
    index().on(t.govtRegistrationId),
    index().on(t.affiliationBodyId),
    index().on(t.createdAt),
  ],
);
