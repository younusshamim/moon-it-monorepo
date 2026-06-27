// Domain 3 — Catalog: courses, curriculum, per-branch offerings. Peer of @moonit/schema/catalog.
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { affiliationBodies } from "./affiliation.js";
import { branches, departments } from "./organization.js";
import { id, timestamps } from "./shared.js";

export const programType = pgEnum("program_type", ["short_course", "language", "diploma"]);
export const deliveryMode = pgEnum("delivery_mode", ["onsite", "online", "hybrid"]);

export const courses = pgTable(
  "courses",
  {
    id: id(),
    departmentId: uuid().references(() => departments.id),
    type: programType().notNull(),
    code: varchar({ length: 24 }).notNull().unique(), // "WEB-101", "IELTS-A"
    title: varchar({ length: 200 }).notNull(),
    slug: varchar({ length: 220 }).notNull().unique(),
    description: text(),
    durationWeeks: integer(), // short courses
    durationMonths: integer(), // diplomas (e.g. 12)
    totalHours: integer(),
    level: varchar({ length: 40 }), // "Beginner", "B2", ...
    defaultMode: deliveryMode().default("onsite").notNull(),
    isGovtAffiliated: boolean().default(false).notNull(),
    affiliationBodyId: uuid().references(() => affiliationBodies.id),
    isPublished: boolean().default(false).notNull(),
    ...timestamps(),
  },
  (t) => [index().on(t.departmentId), index().on(t.affiliationBodyId), index().on(t.createdAt)],
);

export const courseModules = pgTable(
  "course_modules",
  {
    id: id(),
    courseId: uuid()
      .references(() => courses.id)
      .notNull(),
    title: varchar({ length: 200 }).notNull(),
    orderIndex: integer().notNull(),
    ...timestamps(),
  },
  (t) => [index().on(t.courseId), index().on(t.createdAt)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: id(),
    moduleId: uuid()
      .references(() => courseModules.id)
      .notNull(),
    title: varchar({ length: 200 }).notNull(),
    orderIndex: integer().notNull(),
    durationMinutes: integer(),
  },
  (t) => [index().on(t.moduleId)],
);

export const courseOfferings = pgTable(
  "course_offerings",
  {
    id: id(),
    courseId: uuid()
      .references(() => courses.id)
      .notNull(),
    branchId: uuid()
      .references(() => branches.id)
      .notNull(),
    mode: deliveryMode().default("onsite").notNull(),
    baseFee: numeric({ precision: 12, scale: 2 }).notNull(),
    admissionFee: numeric({ precision: 12, scale: 2 }).default("0").notNull(),
    currency: varchar({ length: 3 }).default("BDT").notNull(),
    isActive: boolean().default(true).notNull(),
    ...timestamps(),
  },
  (t) => [index().on(t.courseId), index().on(t.branchId), index().on(t.createdAt)],
);
