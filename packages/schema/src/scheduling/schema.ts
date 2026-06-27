// Domain 4 — Scheduling: batches, weekly schedules, concrete sessions, instructor assignment.
// See DATABASE_DOMAIN.md §4. Concrete `session` rows are generated from `batchSchedule` and become
// the source of truth for attendance, cancellations, and substitutions.
import { z } from "zod";
import { id, isoDate, isoTime, numericString, timestamps } from "../shared/columns.js";

export const BatchStatusSchema = z.enum([
  "planned",
  "open_for_enrollment",
  "running",
  "completed",
  "cancelled",
]);
export type BatchStatus = z.infer<typeof BatchStatusSchema>;

// ── Batch ───────────────────────────────────────────────────────────────────
const batchFields = {
  offeringId: z.uuid(),
  branchId: z.uuid(),
  code: z.string().max(32), // "WEB-101-B07" — unique
  name: z.string().max(120).nullable(),
  status: BatchStatusSchema, // default "planned"
  startDate: isoDate().nullable(),
  endDate: isoDate().nullable(),
  capacity: z.number().int().positive(),
  enrolledCount: z.number().int().nonnegative(), // default 0 — denormalized counter
  feeOverride: numericString().nullable(), // per-batch promo pricing
  defaultRoomId: z.uuid().nullable(),
};

export const BatchSchema = z.object({ id, ...batchFields, ...timestamps });
export const NewBatchSchema = z.object(batchFields).partial({
  name: true,
  status: true,
  startDate: true,
  endDate: true,
  enrolledCount: true,
  feeOverride: true,
  defaultRoomId: true,
});
export const UpdateBatchSchema = NewBatchSchema.partial();

export type Batch = z.infer<typeof BatchSchema>;
export type NewBatch = z.infer<typeof NewBatchSchema>;
export type UpdateBatch = z.infer<typeof UpdateBatchSchema>;

// ── BatchSchedule (recurring weekly slot) ─────────────────────────────────────
const batchScheduleFields = {
  batchId: z.uuid(),
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Sun .. 6 = Sat
  startTime: isoTime(),
  endTime: isoTime(),
  roomId: z.uuid().nullable(),
};

export const BatchScheduleSchema = z.object({ id, ...batchScheduleFields });
export const NewBatchScheduleSchema = z.object(batchScheduleFields).partial({ roomId: true });
export const UpdateBatchScheduleSchema = NewBatchScheduleSchema.partial();

export type BatchSchedule = z.infer<typeof BatchScheduleSchema>;
export type NewBatchSchedule = z.infer<typeof NewBatchScheduleSchema>;
export type UpdateBatchSchedule = z.infer<typeof UpdateBatchScheduleSchema>;

// ── Session (concrete instance) ───────────────────────────────────────────────
const sessionFields = {
  batchId: z.uuid(),
  instructorId: z.uuid().nullable(),
  roomId: z.uuid().nullable(),
  sessionDate: isoDate(),
  startTime: isoTime(),
  endTime: isoTime(),
  topic: z.string().max(200).nullable(),
  isCancelled: z.boolean(), // default false
};

export const SessionSchema = z.object({ id, ...sessionFields, ...timestamps });
export const NewSessionSchema = z.object(sessionFields).partial({
  instructorId: true,
  roomId: true,
  topic: true,
  isCancelled: true,
});
export const UpdateSessionSchema = NewSessionSchema.partial();

export type Session = z.infer<typeof SessionSchema>;
export type NewSession = z.infer<typeof NewSessionSchema>;
export type UpdateSession = z.infer<typeof UpdateSessionSchema>;

// ── BatchInstructor (join — a batch can be team-taught) ───────────────────────
const batchInstructorFields = {
  batchId: z.uuid(),
  instructorId: z.uuid(),
  isLead: z.boolean(), // default false
};

export const BatchInstructorSchema = z.object({ id, ...batchInstructorFields });
export const NewBatchInstructorSchema = z.object(batchInstructorFields).partial({ isLead: true });
export const UpdateBatchInstructorSchema = NewBatchInstructorSchema.partial();

export type BatchInstructor = z.infer<typeof BatchInstructorSchema>;
export type NewBatchInstructor = z.infer<typeof NewBatchInstructorSchema>;
export type UpdateBatchInstructor = z.infer<typeof UpdateBatchInstructorSchema>;
