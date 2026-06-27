import type { Student } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type { students } from "./people.js";

expectTypeOf<InferSelectModel<typeof students>>().toEqualTypeOf<Student>();
