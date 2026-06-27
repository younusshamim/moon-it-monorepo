// Domain 7 — Enrollment & Attendance. See DATABASE_DOMAIN.md §7.
// A student enrolls once per batch (unique studentId+batchId); attendance attaches to a concrete
// session (unique sessionId+enrollmentId).
import { z } from "zod";
import { audit, id, isoDate, isoDateTime, timestamps } from "../shared/columns.js";

export const EnrollmentStatusSchema = z.enum([
  "applied",
  "confirmed",
  "active",
  "completed",
  "dropped",
  "transferred",
]);
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusSchema>;

// ── Enrollment ────────────────────────────────────────────────────────────────
const enrollmentFields = {
  studentId: z.uuid(),
  batchId: z.uuid(),
  status: EnrollmentStatusSchema, // default "applied"
  enrolledAt: isoDate().nullable(),
  completedAt: isoDate().nullable(),
};

export const EnrollmentSchema = z.object({ id, ...enrollmentFields, ...timestamps, ...audit });
export const NewEnrollmentSchema = z.object(enrollmentFields).partial({
  status: true,
  enrolledAt: true,
  completedAt: true,
});
export const UpdateEnrollmentSchema = NewEnrollmentSchema.partial();

export type Enrollment = z.infer<typeof EnrollmentSchema>;
export type NewEnrollment = z.infer<typeof NewEnrollmentSchema>;
export type UpdateEnrollment = z.infer<typeof UpdateEnrollmentSchema>;

// ── Attendance ────────────────────────────────────────────────────────────────
export const AttendanceStatusSchema = z.enum(["present", "absent", "late", "excused"]);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

const attendanceFields = {
  sessionId: z.uuid(),
  enrollmentId: z.uuid(),
  status: AttendanceStatusSchema, // default "present"
  // Modeled explicitly (the domain doc reused `timestamps.createdAt` as a column shorthand).
  markedAt: isoDateTime(), // default now
  markedBy: z.uuid().nullable(),
};

export const AttendanceSchema = z.object({ id, ...attendanceFields });
export const NewAttendanceSchema = z.object(attendanceFields).partial({
  status: true,
  markedAt: true,
  markedBy: true,
});
export const UpdateAttendanceSchema = NewAttendanceSchema.partial();

export type Attendance = z.infer<typeof AttendanceSchema>;
export type NewAttendance = z.infer<typeof NewAttendanceSchema>;
export type UpdateAttendance = z.infer<typeof UpdateAttendanceSchema>;
