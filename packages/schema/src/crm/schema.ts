// Domain 10 — Admissions / CRM: leads and their activity trail. See DATABASE_DOMAIN.md §10.
import { z } from "zod";
import { audit, id, isoDateTime, timestamps } from "../shared/columns.js";

export const LeadStatusSchema = z.enum(["new", "contacted", "interested", "enrolled", "lost"]);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const LeadSourceSchema = z.enum([
  "walk_in",
  "facebook",
  "google",
  "referral",
  "phone",
  "website",
]);
export type LeadSource = z.infer<typeof LeadSourceSchema>;

// ── Lead ────────────────────────────────────────────────────────────────────
const leadFields = {
  branchId: z.uuid(),
  fullName: z.string().max(160),
  phone: z.string().max(32),
  email: z.email().max(160).nullable(),
  interestedCourseId: z.uuid().nullable(),
  source: LeadSourceSchema, // default "walk_in"
  status: LeadStatusSchema, // default "new"
  assignedTo: z.uuid().nullable(),
  notes: z.string().nullable(),
};

export const LeadSchema = z.object({ id, ...leadFields, ...timestamps, ...audit });
export const NewLeadSchema = z.object(leadFields).partial({
  email: true,
  interestedCourseId: true,
  source: true,
  status: true,
  assignedTo: true,
  notes: true,
});
export const UpdateLeadSchema = NewLeadSchema.partial();

export type Lead = z.infer<typeof LeadSchema>;
export type NewLead = z.infer<typeof NewLeadSchema>;
export type UpdateLead = z.infer<typeof UpdateLeadSchema>;

// ── LeadActivity ──────────────────────────────────────────────────────────────
const leadActivityFields = {
  leadId: z.uuid(),
  type: z.string().max(40), // "call", "visit", "follow_up"
  note: z.string().nullable(),
  // Modeled explicitly (the domain doc reused `timestamps.createdAt` as a column shorthand).
  activityAt: isoDateTime(), // default now
  by: z.uuid().nullable(),
};

export const LeadActivitySchema = z.object({ id, ...leadActivityFields });
export const NewLeadActivitySchema = z.object(leadActivityFields).partial({
  note: true,
  activityAt: true,
  by: true,
});
export const UpdateLeadActivitySchema = NewLeadActivitySchema.partial();

export type LeadActivity = z.infer<typeof LeadActivitySchema>;
export type NewLeadActivity = z.infer<typeof NewLeadActivitySchema>;
export type UpdateLeadActivity = z.infer<typeof UpdateLeadActivitySchema>;
