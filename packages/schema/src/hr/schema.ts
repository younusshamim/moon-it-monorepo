// Domain 9 (HR/Staff) — employees and instructors. See DATABASE_DOMAIN.md §5 (hr/schema).
// An instructor may be staff (`employeeId`) or a guest/freelancer (`userId` + `ratePerSession`).
import { z } from "zod";
import { id, isoDate, numericString, timestamps } from "../shared/columns.js";

export const EmployeeStatusSchema = z.enum(["active", "on_leave", "terminated"]);
export type EmployeeStatus = z.infer<typeof EmployeeStatusSchema>;

// ── Employee ──────────────────────────────────────────────────────────────────
const employeeFields = {
  userId: z.uuid().nullable(),
  branchId: z.uuid(),
  employeeCode: z.string().max(24), // unique
  fullName: z.string().max(160),
  designation: z.string().max(80).nullable(),
  phone: z.string().max(32).nullable(),
  status: EmployeeStatusSchema, // default "active"
  joinedAt: isoDate().nullable(),
};

export const EmployeeSchema = z.object({ id, ...employeeFields, ...timestamps });
export const NewEmployeeSchema = z.object(employeeFields).partial({
  userId: true,
  designation: true,
  phone: true,
  status: true,
  joinedAt: true,
});
export const UpdateEmployeeSchema = NewEmployeeSchema.partial();

export type Employee = z.infer<typeof EmployeeSchema>;
export type NewEmployee = z.infer<typeof NewEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;

// ── Instructor ────────────────────────────────────────────────────────────────
const instructorFields = {
  employeeId: z.uuid().nullable(), // staff instructors
  userId: z.uuid().nullable(), // or guest/freelance
  fullName: z.string().max(160),
  expertise: z.array(z.string()).nullable(), // ["React", "IELTS"]
  bio: z.string().max(600).nullable(),
  ratePerSession: numericString().nullable(), // freelance
};

export const InstructorSchema = z.object({ id, ...instructorFields, ...timestamps });
export const NewInstructorSchema = z.object(instructorFields).partial({
  employeeId: true,
  userId: true,
  expertise: true,
  bio: true,
  ratePerSession: true,
});
export const UpdateInstructorSchema = NewInstructorSchema.partial();

export type Instructor = z.infer<typeof InstructorSchema>;
export type NewInstructor = z.infer<typeof NewInstructorSchema>;
export type UpdateInstructor = z.infer<typeof UpdateInstructorSchema>;
