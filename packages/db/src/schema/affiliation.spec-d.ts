import type {
  AffiliationBody,
  GovtExamEvent,
  GovtExamFee,
  GovtExamRegistration,
} from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type {
  affiliationBodies,
  govtExamEvents,
  govtExamFees,
  govtExamRegistrations,
} from "./affiliation.js";

expectTypeOf<InferSelectModel<typeof affiliationBodies>>().toEqualTypeOf<AffiliationBody>();
expectTypeOf<InferSelectModel<typeof govtExamFees>>().toEqualTypeOf<GovtExamFee>();
expectTypeOf<InferSelectModel<typeof govtExamEvents>>().toEqualTypeOf<GovtExamEvent>();
expectTypeOf<
  InferSelectModel<typeof govtExamRegistrations>
>().toEqualTypeOf<GovtExamRegistration>();
