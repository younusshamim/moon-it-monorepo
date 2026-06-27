// Domain 1 — Identity & Access (RBAC): users, roles, permissions, branch-scoped assignment.
// See DATABASE_DOMAIN.md §2. `userRole.branchId` is the multi-branch lever (null = all branches).
import { z } from "zod";
import { id, isoDateTime, timestamps } from "../shared/columns.js";

export const UserStatusSchema = z.enum(["active", "suspended", "invited"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

// ── User ────────────────────────────────────────────────────────────────────
const userFields = {
  email: z.email().max(160), // unique
  phone: z.string().max(32).nullable(), // unique
  passwordHash: z.string().max(255).nullable(),
  fullName: z.string().max(160),
  status: UserStatusSchema, // default "invited"
  // Modeled explicitly as a nullable timestamp (the domain doc's `timestamps.createdAt` reuse
  // was a column-definition shorthand, not the intended semantics).
  emailVerifiedAt: isoDateTime().nullable(),
};

export const UserSchema = z.object({ id, ...userFields, ...timestamps });
export const NewUserSchema = z.object(userFields).partial({
  phone: true,
  passwordHash: true,
  status: true,
  emailVerifiedAt: true,
});
export const UpdateUserSchema = NewUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type NewUser = z.infer<typeof NewUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// ── Role ────────────────────────────────────────────────────────────────────
const roleFields = {
  key: z.string().max(48), // "super_admin", "branch_admin", "instructor", ... — unique
  name: z.string().max(80),
  isSystem: z.boolean(), // default false
};

export const RoleSchema = z.object({ id, ...roleFields });
export const NewRoleSchema = z.object(roleFields).partial({ isSystem: true });
export const UpdateRoleSchema = NewRoleSchema.partial();

export type Role = z.infer<typeof RoleSchema>;
export type NewRole = z.infer<typeof NewRoleSchema>;
export type UpdateRole = z.infer<typeof UpdateRoleSchema>;

// ── Permission ────────────────────────────────────────────────────────────────
const permissionFields = {
  key: z.string().max(80), // "enrollment.create", "invoice.refund" — unique
  description: z.string().max(200).nullable(),
};

export const PermissionSchema = z.object({ id, ...permissionFields });
export const NewPermissionSchema = z.object(permissionFields).partial({ description: true });
export const UpdatePermissionSchema = NewPermissionSchema.partial();

export type Permission = z.infer<typeof PermissionSchema>;
export type NewPermission = z.infer<typeof NewPermissionSchema>;
export type UpdatePermission = z.infer<typeof UpdatePermissionSchema>;

// ── RolePermission (join, composite PK) ───────────────────────────────────────
const rolePermissionFields = {
  roleId: z.uuid(),
  permissionId: z.uuid(),
};

export const RolePermissionSchema = z.object(rolePermissionFields);
export const NewRolePermissionSchema = z.object(rolePermissionFields);
export const UpdateRolePermissionSchema = NewRolePermissionSchema.partial();

export type RolePermission = z.infer<typeof RolePermissionSchema>;
export type NewRolePermission = z.infer<typeof NewRolePermissionSchema>;
export type UpdateRolePermission = z.infer<typeof UpdateRolePermissionSchema>;

// ── UserRole (branch-scoped assignment) ───────────────────────────────────────
const userRoleFields = {
  userId: z.uuid(),
  roleId: z.uuid(),
  branchId: z.uuid().nullable(), // null = all branches (super_admin)
};

export const UserRoleSchema = z.object({ id, ...userRoleFields, ...timestamps });
export const NewUserRoleSchema = z.object(userRoleFields).partial({ branchId: true });
export const UpdateUserRoleSchema = NewUserRoleSchema.partial();

export type UserRole = z.infer<typeof UserRoleSchema>;
export type NewUserRole = z.infer<typeof NewUserRoleSchema>;
export type UpdateUserRole = z.infer<typeof UpdateUserRoleSchema>;
