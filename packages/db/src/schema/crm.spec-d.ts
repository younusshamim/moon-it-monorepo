import type { Lead, LeadActivity } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type { leadActivities, leads } from "./crm.js";

expectTypeOf<InferSelectModel<typeof leads>>().toEqualTypeOf<Lead>();
expectTypeOf<InferSelectModel<typeof leadActivities>>().toEqualTypeOf<LeadActivity>();
