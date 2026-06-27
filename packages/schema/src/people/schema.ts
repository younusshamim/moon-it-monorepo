// Domain 5 (people) — Students. See DATABASE_DOMAIN.md §5. Soft-deletable (legal/audit retention).
import { z } from "zod";
import { audit, id, isoDate, timestamps } from "../shared/columns.js";

export const GenderSchema = z.enum(["male", "female", "other"]);
export type Gender = z.infer<typeof GenderSchema>;

// ── Student ─────────────────────────────────────────────────────────────────
const studentFields = {
  userId: z.uuid().nullable(), // null if no portal login
  homeBranchId: z.uuid(),
  studentCode: z.string().max(24), // "MIT-2026-00142" — unique
  fullName: z.string().max(160),
  phone: z.string().max(32),
  email: z.email().max(160).nullable(),
  gender: GenderSchema.nullable(),
  dateOfBirth: isoDate().nullable(),
  nidOrBirthCert: z.string().max(40).nullable(),
  guardianName: z.string().max(160).nullable(),
  guardianPhone: z.string().max(32).nullable(),
  address: z.string().nullable(),
  photoUrl: z.string().max(400).nullable(),
};

export const StudentSchema = z.object({ id, ...studentFields, ...timestamps, ...audit });
export const NewStudentSchema = z.object(studentFields).partial({
  userId: true,
  email: true,
  gender: true,
  dateOfBirth: true,
  nidOrBirthCert: true,
  guardianName: true,
  guardianPhone: true,
  address: true,
  photoUrl: true,
});
export const UpdateStudentSchema = NewStudentSchema.partial();

export type Student = z.infer<typeof StudentSchema>;
export type NewStudent = z.infer<typeof NewStudentSchema>;
export type UpdateStudent = z.infer<typeof UpdateStudentSchema>;
