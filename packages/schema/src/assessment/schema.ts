// Domain 8 (Assessment) — exams, grades, certificates. See DATABASE_DOMAIN.md §9.
// `certificate.verificationCode` backs a public "verify certificate" endpoint.
import { z } from "zod";
import { id, isoDate, numericString, timestamps } from "../shared/columns.js";

export const ExamTypeSchema = z.enum(["quiz", "midterm", "final", "practical", "assignment"]);
export type ExamType = z.infer<typeof ExamTypeSchema>;

export const CertificateSourceSchema = z.enum(["institute", "government"]);
export type CertificateSource = z.infer<typeof CertificateSourceSchema>;

// ── Exam ────────────────────────────────────────────────────────────────────
const examFields = {
  batchId: z.uuid(),
  type: ExamTypeSchema,
  title: z.string().max(160),
  totalMarks: numericString(),
  passMarks: numericString(),
  weight: numericString(), // default "1" — for final grade calc
  examDate: isoDate().nullable(),
};

export const ExamSchema = z.object({ id, ...examFields, ...timestamps });
export const NewExamSchema = z.object(examFields).partial({
  weight: true,
  examDate: true,
});
export const UpdateExamSchema = NewExamSchema.partial();

export type Exam = z.infer<typeof ExamSchema>;
export type NewExam = z.infer<typeof NewExamSchema>;
export type UpdateExam = z.infer<typeof UpdateExamSchema>;

// ── Grade ───────────────────────────────────────────────────────────────────
const gradeFields = {
  examId: z.uuid(),
  enrollmentId: z.uuid(),
  marksObtained: numericString().nullable(),
  letterGrade: z.string().max(4).nullable(),
  remarks: z.string().max(200).nullable(),
};

export const GradeSchema = z.object({ id, ...gradeFields, ...timestamps });
export const NewGradeSchema = z.object(gradeFields).partial({
  marksObtained: true,
  letterGrade: true,
  remarks: true,
});
export const UpdateGradeSchema = NewGradeSchema.partial();

export type Grade = z.infer<typeof GradeSchema>;
export type NewGrade = z.infer<typeof NewGradeSchema>;
export type UpdateGrade = z.infer<typeof UpdateGradeSchema>;

// ── Certificate ───────────────────────────────────────────────────────────────
const certificateFields = {
  enrollmentId: z.uuid(),
  courseId: z.uuid(),
  source: CertificateSourceSchema, // default "institute"
  govtRegistrationId: z.uuid().nullable(), // set when source = government
  affiliationBodyId: z.uuid().nullable(),
  certificateNumber: z.string().max(40), // unique
  issuedAt: isoDate(),
  finalGrade: z.string().max(8).nullable(),
  verificationCode: z.string().max(64).nullable(), // public QR verify — unique
  pdfUrl: z.string().max(400).nullable(),
};

export const CertificateSchema = z.object({ id, ...certificateFields, ...timestamps });
export const NewCertificateSchema = z.object(certificateFields).partial({
  source: true,
  govtRegistrationId: true,
  affiliationBodyId: true,
  finalGrade: true,
  verificationCode: true,
  pdfUrl: true,
});
export const UpdateCertificateSchema = NewCertificateSchema.partial();

export type Certificate = z.infer<typeof CertificateSchema>;
export type NewCertificate = z.infer<typeof NewCertificateSchema>;
export type UpdateCertificate = z.infer<typeof UpdateCertificateSchema>;
