import type { Batch, BatchInstructor, BatchSchedule, Session } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type { batches, batchInstructors, batchSchedules, sessions } from "./scheduling.js";

expectTypeOf<InferSelectModel<typeof batches>>().toEqualTypeOf<Batch>();
expectTypeOf<InferSelectModel<typeof batchSchedules>>().toEqualTypeOf<BatchSchedule>();
expectTypeOf<InferSelectModel<typeof sessions>>().toEqualTypeOf<Session>();
expectTypeOf<InferSelectModel<typeof batchInstructors>>().toEqualTypeOf<BatchInstructor>();
