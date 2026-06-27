import type { Course, CourseModule, CourseOffering, Lesson } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type { courseModules, courseOfferings, courses, lessons } from "./catalog.js";

expectTypeOf<InferSelectModel<typeof courses>>().toEqualTypeOf<Course>();
expectTypeOf<InferSelectModel<typeof courseModules>>().toEqualTypeOf<CourseModule>();
expectTypeOf<InferSelectModel<typeof lessons>>().toEqualTypeOf<Lesson>();
expectTypeOf<InferSelectModel<typeof courseOfferings>>().toEqualTypeOf<CourseOffering>();
