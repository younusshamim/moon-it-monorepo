import type {
  Discount,
  Installment,
  Invoice,
  InvoiceLine,
  Payment,
  PaymentAllocation,
  Refund,
} from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type {
  discounts,
  installments,
  invoiceLines,
  invoices,
  paymentAllocations,
  payments,
  refunds,
} from "./finance.js";

expectTypeOf<InferSelectModel<typeof invoices>>().toEqualTypeOf<Invoice>();
expectTypeOf<InferSelectModel<typeof invoiceLines>>().toEqualTypeOf<InvoiceLine>();
expectTypeOf<InferSelectModel<typeof installments>>().toEqualTypeOf<Installment>();
expectTypeOf<InferSelectModel<typeof payments>>().toEqualTypeOf<Payment>();
expectTypeOf<InferSelectModel<typeof paymentAllocations>>().toEqualTypeOf<PaymentAllocation>();
expectTypeOf<InferSelectModel<typeof discounts>>().toEqualTypeOf<Discount>();
expectTypeOf<InferSelectModel<typeof refunds>>().toEqualTypeOf<Refund>();
