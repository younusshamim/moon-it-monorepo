import type { Course, CourseModule, CourseOffering, CourseVariant, Lesson } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type {
  courseModules,
  courseOfferings,
  courses,
  courseVariants,
  lessons,
} from "./catalog.js";

expectTypeOf<InferSelectModel<typeof courses>>().toEqualTypeOf<Course>();
expectTypeOf<InferSelectModel<typeof courseModules>>().toEqualTypeOf<CourseModule>();
expectTypeOf<InferSelectModel<typeof lessons>>().toEqualTypeOf<Lesson>();
expectTypeOf<InferSelectModel<typeof courseVariants>>().toEqualTypeOf<CourseVariant>();
expectTypeOf<InferSelectModel<typeof courseOfferings>>().toEqualTypeOf<CourseOffering>();
