// Domain 6 — Affiliation: affiliation bodies, government exam fees, exam events, and the
// student exam-registration aggregate. See DATABASE_DOMAIN.md §6. Registration fees are tracked
// separately from `courseOffering.baseFee`; the fee invoice references the registration (not
// the other way around) via `invoices.govtRegistrationId`.
import { z } from "zod";
import { audit, id, isoDate, numericString, timestamps } from "../shared/columns.js";

// ── AffiliationBody ───────────────────────────────────────────────────────────
const affiliationBodyFields = {
  code: z.string().max(24), // "BTEB", "NSDA" — unique
  name: z.string().max(200),
  website: z.url().max(240).nullable(),
  isActive: z.boolean(), // default true
};

export const AffiliationBodySchema = z.object({ id, ...affiliationBodyFields, ...timestamps });
export const NewAffiliationBodySchema = z.object(affiliationBodyFields).partial({
  website: true,
  isActive: true,
});
export const UpdateAffiliationBodySchema = NewAffiliationBodySchema.partial();

export type AffiliationBody = z.infer<typeof AffiliationBodySchema>;
export type NewAffiliationBody = z.infer<typeof NewAffiliationBodySchema>;
export type UpdateAffiliationBody = z.infer<typeof UpdateAffiliationBodySchema>;

// ── GovtExamFee (registration fee per affiliated course) ──────────────────────
const govtExamFeeFields = {
  courseId: z.uuid(),
  branchId: z.uuid().nullable(), // null = applies institute-wide
  registrationFee: numericString(),
  currency: z.string().length(3), // default "BDT"
  validFrom: isoDate().nullable(),
  validTo: isoDate().nullable(),
  isActive: z.boolean(), // default true
};

export const GovtExamFeeSchema = z.object({ id, ...govtExamFeeFields, ...timestamps });
export const NewGovtExamFeeSchema = z.object(govtExamFeeFields).partial({
  branchId: true,
  currency: true,
  validFrom: true,
  validTo: true,
  isActive: true,
});
export const UpdateGovtExamFeeSchema = NewGovtExamFeeSchema.partial();

export type GovtExamFee = z.infer<typeof GovtExamFeeSchema>;
export type NewGovtExamFee = z.infer<typeof NewGovtExamFeeSchema>;
export type UpdateGovtExamFee = z.infer<typeof UpdateGovtExamFeeSchema>;

// ── GovtExamEvent (a dated exam sitting run by the body) ──────────────────────
const govtExamEventFields = {
  affiliationBodyId: z.uuid(),
  courseId: z.uuid(),
  title: z.string().max(200), // "BTEB Web Design — June 2026"
  examDate: isoDate().nullable(),
  registrationOpensAt: isoDate().nullable(),
  registrationClosesAt: isoDate().nullable(),
  resultPublishedAt: isoDate().nullable(),
};

export const GovtExamEventSchema = z.object({ id, ...govtExamEventFields, ...timestamps });
export const NewGovtExamEventSchema = z.object(govtExamEventFields).partial({
  examDate: true,
  registrationOpensAt: true,
  registrationClosesAt: true,
  resultPublishedAt: true,
});
export const UpdateGovtExamEventSchema = NewGovtExamEventSchema.partial();

export type GovtExamEvent = z.infer<typeof GovtExamEventSchema>;
export type NewGovtExamEvent = z.infer<typeof NewGovtExamEventSchema>;
export type UpdateGovtExamEvent = z.infer<typeof UpdateGovtExamEventSchema>;

// ── GovtExamRegistration (the registration aggregate) ─────────────────────────
export const GovtRegStatusSchema = z.enum([
  "pending_payment", // opted in, fee not yet settled
  "registered", // fee paid, submitted to board
  "admit_issued", // admit card / roll received
  "appeared", // sat the exam
  "passed",
  "failed",
  "absent",
  "cancelled",
]);
export type GovtRegStatus = z.infer<typeof GovtRegStatusSchema>;

const govtExamRegistrationFields = {
  studentId: z.uuid(),
  enrollmentId: z.uuid().nullable(), // usually tied to their batch, but not required
  examEventId: z.uuid(),
  branchId: z.uuid(),
  status: GovtRegStatusSchema, // default "pending_payment"
  boardRollNumber: z.string().max(48).nullable(), // assigned by the body
  boardRegistrationNumber: z.string().max(48).nullable(),
  resultGrade: z.string().max(16).nullable(),
  resultMarks: numericString().nullable(),
  registeredAt: isoDate().nullable(),
};

export const GovtExamRegistrationSchema = z.object({
  id,
  ...govtExamRegistrationFields,
  ...timestamps,
  ...audit,
});
export const NewGovtExamRegistrationSchema = z.object(govtExamRegistrationFields).partial({
  enrollmentId: true,
  status: true,
  boardRollNumber: true,
  boardRegistrationNumber: true,
  resultGrade: true,
  resultMarks: true,
  registeredAt: true,
});
export const UpdateGovtExamRegistrationSchema = NewGovtExamRegistrationSchema.partial();

export type GovtExamRegistration = z.infer<typeof GovtExamRegistrationSchema>;
export type NewGovtExamRegistration = z.infer<typeof NewGovtExamRegistrationSchema>;
export type UpdateGovtExamRegistration = z.infer<typeof UpdateGovtExamRegistrationSchema>;
