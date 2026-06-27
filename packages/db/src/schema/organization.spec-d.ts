// Compile-time drift guard: each Drizzle table's inferred select row must equal its @moonit/schema
// wire entity. Fails `typecheck` if the table and the contract drift (INFRASTRUCTURE.md §4, §7).
import type { Branch, Department, Room } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type { branches, departments, rooms } from "./organization.js";

expectTypeOf<InferSelectModel<typeof branches>>().toEqualTypeOf<Branch>();
expectTypeOf<InferSelectModel<typeof rooms>>().toEqualTypeOf<Room>();
expectTypeOf<InferSelectModel<typeof departments>>().toEqualTypeOf<Department>();
