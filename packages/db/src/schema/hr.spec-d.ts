import type { Employee, Instructor } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type { employees, instructors } from "./hr.js";

expectTypeOf<InferSelectModel<typeof employees>>().toEqualTypeOf<Employee>();
expectTypeOf<InferSelectModel<typeof instructors>>().toEqualTypeOf<Instructor>();
