// Domain 8 — Finance: invoices, lines, installments, payments, allocations, discounts, refunds.
// Peer of @moonit/schema/finance.
import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { govtExamRegistrations } from "./affiliation.js";
import { enrollments } from "./enrollment.js";
import { branches } from "./organization.js";
import { students } from "./people.js";
import { audit, id, timestamps } from "./shared.js";

export const invoiceStatus = pgEnum("invoice_status", [
  "draft",
  "issued",
  "partially_paid",
  "paid",
  "void",
]);
export const invoicePurpose = pgEnum("invoice_purpose", ["course_fee", "govt_exam_fee"]);

export const invoices = pgTable(
  "invoices",
  {
    id: id(),
    branchId: uuid()
      .references(() => branches.id)
      .notNull(),
    studentId: uuid()
      .references(() => students.id)
      .notNull(),
    enrollmentId: uuid().references(() => enrollments.id),
    invoiceNumber: varchar({ length: 32 }).notNull().unique(),
    status: invoiceStatus().default("draft").notNull(),
    purpose: invoicePurpose().default("course_fee").notNull(),
    govtRegistrationId: uuid()
      .references(() => govtExamRegistrations.id)
      .unique(),
    discountId: uuid().references(() => discounts.id), // which discount produced discountTotal
    currency: varchar({ length: 3 }).default("BDT").notNull(),
    subtotal: numeric({ precision: 12, scale: 2 }).notNull(),
    discountTotal: numeric({ precision: 12, scale: 2 }).default("0").notNull(),
    taxTotal: numeric({ precision: 12, scale: 2 }).default("0").notNull(),
    grandTotal: numeric({ precision: 12, scale: 2 }).notNull(),
    amountPaid: numeric({ precision: 12, scale: 2 }).default("0").notNull(),
    dueDate: date(),
    issuedAt: date(),
    ...timestamps(),
    ...audit(),
  },
  (t) => [
    index().on(t.branchId),
    index().on(t.studentId),
    index().on(t.enrollmentId),
    index().on(t.discountId),
    index().on(t.createdAt),
  ],
);

export const invoiceLines = pgTable(
  "invoice_lines",
  {
    id: id(),
    invoiceId: uuid()
      .references(() => invoices.id)
      .notNull(),
    description: varchar({ length: 200 }).notNull(), // "Course Fee", "Admission Fee"
    quantity: integer().default(1).notNull(),
    unitPrice: numeric({ precision: 12, scale: 2 }).notNull(),
    lineTotal: numeric({ precision: 12, scale: 2 }).notNull(),
  },
  (t) => [index().on(t.invoiceId)],
);

export const installments = pgTable(
  "installments",
  {
    id: id(),
    invoiceId: uuid()
      .references(() => invoices.id)
      .notNull(),
    sequence: integer().notNull(), // 1, 2, 3
    dueDate: date().notNull(),
    amountDue: numeric({ precision: 12, scale: 2 }).notNull(),
    amountPaid: numeric({ precision: 12, scale: 2 }).default("0").notNull(),
  },
  (t) => [index().on(t.invoiceId)],
);

export const paymentMethod = pgEnum("payment_method", [
  "cash",
  "bkash",
  "nagad",
  "rocket",
  "card",
  "bank_transfer",
]);
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

export const payments = pgTable(
  "payments",
  {
    id: id(),
    branchId: uuid()
      .references(() => branches.id)
      .notNull(),
    invoiceId: uuid().references(() => invoices.id),
    studentId: uuid()
      .references(() => students.id)
      .notNull(),
    receiptNumber: varchar({ length: 32 }).notNull().unique(),
    method: paymentMethod().notNull(),
    status: paymentStatus().default("succeeded").notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    reference: varchar({ length: 120 }), // bKash trx id
    paidAt: date(),
    receivedBy: uuid(),
    ...timestamps(),
    ...audit(),
  },
  (t) => [
    index().on(t.branchId),
    index().on(t.invoiceId),
    index().on(t.studentId),
    index().on(t.createdAt),
  ],
);

export const paymentAllocations = pgTable(
  "payment_allocations",
  {
    id: id(),
    paymentId: uuid()
      .references(() => payments.id)
      .notNull(),
    installmentId: uuid()
      .references(() => installments.id)
      .notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
  },
  (t) => [index().on(t.paymentId), index().on(t.installmentId)],
);

export const discountType = pgEnum("discount_type", ["percentage", "fixed"]);

export const discounts = pgTable(
  "discounts",
  {
    id: id(),
    branchId: uuid().references(() => branches.id),
    code: varchar({ length: 32 }).unique(),
    name: varchar({ length: 120 }).notNull(),
    type: discountType().notNull(),
    value: numeric({ precision: 12, scale: 2 }).notNull(),
    validFrom: date(),
    validTo: date(),
  },
  (t) => [index().on(t.branchId)],
);

export const refunds = pgTable(
  "refunds",
  {
    id: id(),
    paymentId: uuid()
      .references(() => payments.id)
      .notNull(),
    amount: numeric({ precision: 12, scale: 2 }).notNull(),
    reason: text(),
    approvedBy: uuid(),
    ...timestamps(),
  },
  (t) => [index().on(t.paymentId), index().on(t.createdAt)],
);
