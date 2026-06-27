import type { Certificate, Exam, Grade } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type { certificates, exams, grades } from "./assessment.js";

expectTypeOf<InferSelectModel<typeof exams>>().toEqualTypeOf<Exam>();
expectTypeOf<InferSelectModel<typeof grades>>().toEqualTypeOf<Grade>();
expectTypeOf<InferSelectModel<typeof certificates>>().toEqualTypeOf<Certificate>();
