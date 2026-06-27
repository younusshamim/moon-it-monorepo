// Domain 8 — Finance: invoices, line items, installments, payments, allocations, discounts,
// refunds. See DATABASE_DOMAIN.md §8. Payments allocate against installments (never a single
// "paid?" boolean) so overdue installments are answerable cleanly.
import { z } from "zod";
import { audit, id, isoDate, numericString, timestamps } from "../shared/columns.js";

export const InvoiceStatusSchema = z.enum(["draft", "issued", "partially_paid", "paid", "void"]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const InvoicePurposeSchema = z.enum(["course_fee", "govt_exam_fee"]);
export type InvoicePurpose = z.infer<typeof InvoicePurposeSchema>;

// ── Invoice ─────────────────────────────────────────────────────────────────
const invoiceFields = {
  branchId: z.uuid(),
  studentId: z.uuid(),
  enrollmentId: z.uuid().nullable(),
  invoiceNumber: z.string().max(32), // unique
  status: InvoiceStatusSchema, // default "draft"
  purpose: InvoicePurposeSchema, // default "course_fee"
  govtRegistrationId: z.uuid().nullable(),
  currency: z.string().length(3), // default "BDT"
  subtotal: numericString(),
  discountTotal: numericString(), // default "0"
  taxTotal: numericString(), // default "0"
  grandTotal: numericString(),
  amountPaid: numericString(), // default "0" — maintained from payments
  dueDate: isoDate().nullable(),
  issuedAt: isoDate().nullable(),
};

export const InvoiceSchema = z.object({ id, ...invoiceFields, ...timestamps, ...audit });
export const NewInvoiceSchema = z.object(invoiceFields).partial({
  enrollmentId: true,
  status: true,
  purpose: true,
  govtRegistrationId: true,
  currency: true,
  discountTotal: true,
  taxTotal: true,
  amountPaid: true,
  dueDate: true,
  issuedAt: true,
});
export const UpdateInvoiceSchema = NewInvoiceSchema.partial();

export type Invoice = z.infer<typeof InvoiceSchema>;
export type NewInvoice = z.infer<typeof NewInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof UpdateInvoiceSchema>;

// ── InvoiceLine ───────────────────────────────────────────────────────────────
const invoiceLineFields = {
  invoiceId: z.uuid(),
  description: z.string().max(200), // "Course Fee", "Admission Fee"
  quantity: z.number().int().positive(), // default 1
  unitPrice: numericString(),
  lineTotal: numericString(),
};

export const InvoiceLineSchema = z.object({ id, ...invoiceLineFields });
export const NewInvoiceLineSchema = z.object(invoiceLineFields).partial({ quantity: true });
export const UpdateInvoiceLineSchema = NewInvoiceLineSchema.partial();

export type InvoiceLine = z.infer<typeof InvoiceLineSchema>;
export type NewInvoiceLine = z.infer<typeof NewInvoiceLineSchema>;
export type UpdateInvoiceLine = z.infer<typeof UpdateInvoiceLineSchema>;

// ── Installment ───────────────────────────────────────────────────────────────
const installmentFields = {
  invoiceId: z.uuid(),
  sequence: z.number().int().positive(), // 1, 2, 3
  dueDate: isoDate(),
  amountDue: numericString(),
  amountPaid: numericString(), // default "0"
};

export const InstallmentSchema = z.object({ id, ...installmentFields });
export const NewInstallmentSchema = z.object(installmentFields).partial({ amountPaid: true });
export const UpdateInstallmentSchema = NewInstallmentSchema.partial();

export type Installment = z.infer<typeof InstallmentSchema>;
export type NewInstallment = z.infer<typeof NewInstallmentSchema>;
export type UpdateInstallment = z.infer<typeof UpdateInstallmentSchema>;

// ── Payment ─────────────────────────────────────────────────────────────────
export const PaymentMethodSchema = z.enum([
  "cash",
  "bkash",
  "nagad",
  "rocket",
  "card",
  "bank_transfer",
]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const PaymentStatusSchema = z.enum(["pending", "succeeded", "failed", "refunded"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

const paymentFields = {
  branchId: z.uuid(),
  invoiceId: z.uuid().nullable(),
  studentId: z.uuid(),
  receiptNumber: z.string().max(32), // unique
  method: PaymentMethodSchema,
  status: PaymentStatusSchema, // default "succeeded"
  amount: numericString(),
  reference: z.string().max(120).nullable(), // bKash trx id
  paidAt: isoDate().nullable(),
  receivedBy: z.uuid().nullable(),
};

export const PaymentSchema = z.object({ id, ...paymentFields, ...timestamps, ...audit });
export const NewPaymentSchema = z.object(paymentFields).partial({
  invoiceId: true,
  status: true,
  reference: true,
  paidAt: true,
  receivedBy: true,
});
export const UpdatePaymentSchema = NewPaymentSchema.partial();

export type Payment = z.infer<typeof PaymentSchema>;
export type NewPayment = z.infer<typeof NewPaymentSchema>;
export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;

// ── PaymentAllocation (one payment can cover multiple installments) ───────────
const paymentAllocationFields = {
  paymentId: z.uuid(),
  installmentId: z.uuid(),
  amount: numericString(),
};

export const PaymentAllocationSchema = z.object({ id, ...paymentAllocationFields });
export const NewPaymentAllocationSchema = z.object(paymentAllocationFields);
export const UpdatePaymentAllocationSchema = NewPaymentAllocationSchema.partial();

export type PaymentAllocation = z.infer<typeof PaymentAllocationSchema>;
export type NewPaymentAllocation = z.infer<typeof NewPaymentAllocationSchema>;
export type UpdatePaymentAllocation = z.infer<typeof UpdatePaymentAllocationSchema>;

// ── Discount ────────────────────────────────────────────────────────────────
export const DiscountTypeSchema = z.enum(["percentage", "fixed"]);
export type DiscountType = z.infer<typeof DiscountTypeSchema>;

const discountFields = {
  branchId: z.uuid().nullable(),
  code: z.string().max(32).nullable(), // unique
  name: z.string().max(120),
  type: DiscountTypeSchema,
  value: numericString(),
  validFrom: isoDate().nullable(),
  validTo: isoDate().nullable(),
};

export const DiscountSchema = z.object({ id, ...discountFields });
export const NewDiscountSchema = z.object(discountFields).partial({
  branchId: true,
  code: true,
  validFrom: true,
  validTo: true,
});
export const UpdateDiscountSchema = NewDiscountSchema.partial();

export type Discount = z.infer<typeof DiscountSchema>;
export type NewDiscount = z.infer<typeof NewDiscountSchema>;
export type UpdateDiscount = z.infer<typeof UpdateDiscountSchema>;

// ── Refund ──────────────────────────────────────────────────────────────────
const refundFields = {
  paymentId: z.uuid(),
  amount: numericString(),
  reason: z.string().nullable(),
  approvedBy: z.uuid().nullable(),
};

export const RefundSchema = z.object({ id, ...refundFields, ...timestamps });
export const NewRefundSchema = z.object(refundFields).partial({
  reason: true,
  approvedBy: true,
});
export const UpdateRefundSchema = NewRefundSchema.partial();

export type Refund = z.infer<typeof RefundSchema>;
export type NewRefund = z.infer<typeof NewRefundSchema>;
export type UpdateRefund = z.infer<typeof UpdateRefundSchema>;
