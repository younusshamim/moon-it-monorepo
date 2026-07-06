// Domain 3 — Catalog: courses, curriculum, per-branch offerings. Peer of @moonit/schema/catalog.
import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  unique,
  uniqueIndex,
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
    code: varchar({ length: 24 }).notNull(), // "WEB-101", "IELTS-A"
    title: varchar({ length: 200 }).notNull(),
    slug: varchar({ length: 220 }).notNull(),
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
  (t) => [
    // A soft-deleted course shouldn't permanently block reusing its code/slug.
    uniqueIndex("courses_code_live_uq").on(t.code).where(sql`${t.deletedAt} IS NULL`),
    uniqueIndex("courses_slug_live_uq").on(t.slug).where(sql`${t.deletedAt} IS NULL`),
    index().on(t.departmentId),
    index().on(t.affiliationBodyId),
    index().on(t.createdAt),
  ],
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

// Optional varieties of a course ("Regular", "Premium", "Crash"). Branch-agnostic catalog rows;
// pricing lives on the referencing course_offerings, not here. A course with no varieties has none.
export const courseVariants = pgTable(
  "course_variants",
  {
    id: id(),
    courseId: uuid()
      .references(() => courses.id)
      .notNull(),
    name: varchar({ length: 120 }).notNull(), // "Regular", "Premium", "Weekend Batch"
    code: varchar({ length: 24 }), // optional short code
    description: text(),
    orderIndex: integer().default(0).notNull(),
    isActive: boolean().default(true).notNull(),
    ...timestamps(),
  },
  (t) => [
    unique().on(t.courseId, t.name), // no duplicate variety names within a course
    unique().on(t.courseId, t.id), // composite-FK target for course_offerings.(courseId, variantId)
    index().on(t.courseId),
    index().on(t.createdAt),
  ],
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
    variantId: uuid(), // optional variety; null = the course's plain single-price offering
    mode: deliveryMode().default("onsite").notNull(),
    baseFee: numeric({ precision: 12, scale: 2 }).notNull(),
    admissionFee: numeric({ precision: 12, scale: 2 }).default("0").notNull(),
    currency: varchar({ length: 3 }).default("BDT").notNull(),
    isActive: boolean().default(true).notNull(),
    ...timestamps(),
  },
  (t) => [
    // One offering per course+branch+mode+variety. NULLS NOT DISTINCT keeps the no-variety case
    // (variantId null) to a single offering per course+branch+mode.
    unique().on(t.courseId, t.branchId, t.mode, t.variantId).nullsNotDistinct(),
    // A referenced variety must belong to the same course; skipped automatically when variantId is null.
    foreignKey({
      columns: [t.courseId, t.variantId],
      foreignColumns: [courseVariants.courseId, courseVariants.id],
    }),
    index().on(t.courseId),
    index().on(t.branchId),
    index().on(t.variantId),
    index().on(t.createdAt),
  ],
);
