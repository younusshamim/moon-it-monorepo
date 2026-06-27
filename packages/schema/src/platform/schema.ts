// Domain 11 — Communication & platform audit: notifications and the append-only audit log.
// See DATABASE_DOMAIN.md §11.
import { z } from "zod";
import { id, isoDateTime, timestamps } from "../shared/columns.js";

// ── Notification ──────────────────────────────────────────────────────────────
const notificationFields = {
  recipientUserId: z.uuid().nullable(),
  channel: z.string().max(16), // "sms", "email", "in_app"
  title: z.string().max(200).nullable(),
  body: z.string().nullable(),
  // Modeled explicitly (the domain doc reused `timestamps.deletedAt` / `timestamps.createdAt`).
  readAt: isoDateTime().nullable(),
  sentAt: isoDateTime(), // default now
};

export const NotificationSchema = z.object({ id, ...notificationFields });
export const NewNotificationSchema = z.object(notificationFields).partial({
  recipientUserId: true,
  title: true,
  body: true,
  readAt: true,
  sentAt: true,
});
export const UpdateNotificationSchema = NewNotificationSchema.partial();

export type Notification = z.infer<typeof NotificationSchema>;
export type NewNotification = z.infer<typeof NewNotificationSchema>;
export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>;

// ── AuditLog (append-only) ────────────────────────────────────────────────────
const auditLogFields = {
  actorUserId: z.uuid().nullable(),
  branchId: z.uuid().nullable(),
  action: z.string().max(80), // "invoice.void"
  entityType: z.string().max(60),
  entityId: z.uuid().nullable(),
  // Row snapshots: a jsonb object or null. Typed as a record (not `z.unknown()`, which produces an
  // optional key) so the Drizzle column's required nullable row exactly matches (INFRASTRUCTURE.md §4).
  before: z.record(z.string(), z.unknown()).nullable(),
  after: z.record(z.string(), z.unknown()).nullable(),
};

export const AuditLogSchema = z.object({ id, ...auditLogFields, ...timestamps });
export const NewAuditLogSchema = z.object(auditLogFields).partial({
  actorUserId: true,
  branchId: true,
  entityId: true,
  before: true,
  after: true,
});
export const UpdateAuditLogSchema = NewAuditLogSchema.partial();

export type AuditLog = z.infer<typeof AuditLogSchema>;
export type NewAuditLog = z.infer<typeof NewAuditLogSchema>;
export type UpdateAuditLog = z.infer<typeof UpdateAuditLogSchema>;
