import type { Permission, Role, RolePermission, User, UserRole } from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import { expectTypeOf } from "vitest";
import type { permissions, rolePermissions, roles, userRoles, users } from "./iam.js";

expectTypeOf<InferSelectModel<typeof users>>().toEqualTypeOf<User>();
expectTypeOf<InferSelectModel<typeof roles>>().toEqualTypeOf<Role>();
expectTypeOf<InferSelectModel<typeof permissions>>().toEqualTypeOf<Permission>();
expectTypeOf<InferSelectModel<typeof rolePermissions>>().toEqualTypeOf<RolePermission>();
expectTypeOf<InferSelectModel<typeof userRoles>>().toEqualTypeOf<UserRole>();
