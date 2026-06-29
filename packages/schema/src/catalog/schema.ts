// Domain 3 — Catalog: programs, courses, curriculum, per-branch offerings & fees.
// See DATABASE_DOMAIN.md §3. `course` is the branch-agnostic definition; `courseOffering` is the
// per-branch priced offering — the split that prevents course duplication across branches.
import { z } from "zod";
import { id, numericString, timestamps } from "../shared/columns.js";

export const ProgramTypeSchema = z.enum(["short_course", "language", "diploma"]);
export type ProgramType = z.infer<typeof ProgramTypeSchema>;

export const DeliveryModeSchema = z.enum(["onsite", "online", "hybrid"]);
export type DeliveryMode = z.infer<typeof DeliveryModeSchema>;

// ── Course (global definition) ────────────────────────────────────────────────
const courseFields = {
  departmentId: z.uuid().nullable(),
  type: ProgramTypeSchema,
  code: z.string().max(24), // "WEB-101", "IELTS-A" — unique
  title: z.string().max(200),
  slug: z.string().max(220), // unique
  description: z.string().nullable(),
  durationWeeks: z.number().int().positive().nullable(), // short courses
  durationMonths: z.number().int().positive().nullable(), // diplomas (e.g. 12)
  totalHours: z.number().int().positive().nullable(),
  level: z.string().max(40).nullable(), // "Beginner", "B2", ...
  defaultMode: DeliveryModeSchema, // default "onsite"
  isGovtAffiliated: z.boolean(), // default false
  affiliationBodyId: z.uuid().nullable(),
  isPublished: z.boolean(), // default false
};

export const CourseSchema = z.object({ id, ...courseFields, ...timestamps });
export const NewCourseSchema = z.object(courseFields).partial({
  departmentId: true,
  description: true,
  durationWeeks: true,
  durationMonths: true,
  totalHours: true,
  level: true,
  defaultMode: true,
  isGovtAffiliated: true,
  affiliationBodyId: true,
  isPublished: true,
});
export const UpdateCourseSchema = NewCourseSchema.partial();

export type Course = z.infer<typeof CourseSchema>;
export type NewCourse = z.infer<typeof NewCourseSchema>;
export type UpdateCourse = z.infer<typeof UpdateCourseSchema>;

// ── CourseModule ──────────────────────────────────────────────────────────────
const courseModuleFields = {
  courseId: z.uuid(),
  title: z.string().max(200),
  orderIndex: z.number().int().nonnegative(),
};

export const CourseModuleSchema = z.object({ id, ...courseModuleFields, ...timestamps });
export const NewCourseModuleSchema = z.object(courseModuleFields);
export const UpdateCourseModuleSchema = NewCourseModuleSchema.partial();

export type CourseModule = z.infer<typeof CourseModuleSchema>;
export type NewCourseModule = z.infer<typeof NewCourseModuleSchema>;
export type UpdateCourseModule = z.infer<typeof UpdateCourseModuleSchema>;

// ── Lesson ──────────────────────────────────────────────────────────────────
const lessonFields = {
  moduleId: z.uuid(),
  title: z.string().max(200),
  orderIndex: z.number().int().nonnegative(),
  durationMinutes: z.number().int().positive().nullable(),
};

export const LessonSchema = z.object({ id, ...lessonFields });
export const NewLessonSchema = z.object(lessonFields).partial({ durationMinutes: true });
export const UpdateLessonSchema = NewLessonSchema.partial();

export type Lesson = z.infer<typeof LessonSchema>;
export type NewLesson = z.infer<typeof NewLessonSchema>;
export type UpdateLesson = z.infer<typeof UpdateLessonSchema>;

// ── CourseVariant (optional priced varieties of a course) ─────────────────────
// Optional: a course with no varieties has zero rows here. A variety is a branch-agnostic catalog
// concept ("Regular", "Premium", "Crash"); its price lives on the `courseOffering` rows that
// reference it (variantId), so price is never duplicated and can still differ per branch.
const courseVariantFields = {
  courseId: z.uuid(),
  name: z.string().max(120), // "Regular", "Premium", "Weekend Batch" — unique per course
  code: z.string().max(24).nullable(), // optional short code
  description: z.string().nullable(),
  orderIndex: z.number().int().nonnegative(), // default 0
  isActive: z.boolean(), // default true
};

export const CourseVariantSchema = z.object({ id, ...courseVariantFields, ...timestamps });
export const NewCourseVariantSchema = z.object(courseVariantFields).partial({
  code: true,
  description: true,
  orderIndex: true,
  isActive: true,
});
export const UpdateCourseVariantSchema = NewCourseVariantSchema.partial();

export type CourseVariant = z.infer<typeof CourseVariantSchema>;
export type NewCourseVariant = z.infer<typeof NewCourseVariantSchema>;
export type UpdateCourseVariant = z.infer<typeof UpdateCourseVariantSchema>;

// ── CourseOffering (per-branch, priced) ───────────────────────────────────────
const courseOfferingFields = {
  courseId: z.uuid(),
  branchId: z.uuid(),
  variantId: z.uuid().nullable(), // optional variety; null = the course's plain single-price offering
  mode: DeliveryModeSchema, // default "onsite"
  baseFee: numericString(),
  admissionFee: numericString(), // default "0"
  currency: z.string().length(3), // default "BDT"
  isActive: z.boolean(), // default true
};

export const CourseOfferingSchema = z.object({ id, ...courseOfferingFields, ...timestamps });
export const NewCourseOfferingSchema = z.object(courseOfferingFields).partial({
  variantId: true,
  mode: true,
  admissionFee: true,
  currency: true,
  isActive: true,
});
export const UpdateCourseOfferingSchema = NewCourseOfferingSchema.partial();

export type CourseOffering = z.infer<typeof CourseOfferingSchema>;
export type NewCourseOffering = z.infer<typeof NewCourseOfferingSchema>;
export type UpdateCourseOffering = z.infer<typeof UpdateCourseOfferingSchema>;
