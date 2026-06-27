import type { Attendance, Enrollment } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type { attendance, enrollments } from "./enrollment.js";

expectTypeOf<InferSelectModel<typeof enrollments>>().toEqualTypeOf<Enrollment>();
expectTypeOf<InferSelectModel<typeof attendance>>().toEqualTypeOf<Attendance>();
