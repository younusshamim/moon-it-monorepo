// Domain 1 — Identity & Access: the RBAC catalog. Single source of truth for the permission keys and
// the per-role grant map, shared by the seed (@moonit/db) and the authorization guard (apps/api, Phase
// 6) so they can never disagree (docs/API_AND_AUTH_PLAN.md, Resolved decision #5). It lives here in the
// zero-dependency contract package — not in @moonit/auth — because @moonit/db seeds from it and
// @moonit/auth depends on @moonit/db, which would otherwise cycle.
//
// Keys are coarse (one `read` + one `manage` per resource) and cover only the modules built so far —
// Organization (branches/rooms/departments) and IAM (users/roles/permissions). New domains add keys
// here as their modules land. Role keys mirror the seeded `roles.key` values (@moonit/db seed) and the
// @moonit/auth `ROLES` enum: super_admin / branch_admin / staff / instructor.

/** Typed permission keys. The map is the source of truth for the key strings. */
export const PERMISSIONS = {
  BRANCH_READ: "branch.read",
  BRANCH_MANAGE: "branch.manage",
  ROOM_READ: "room.read",
  ROOM_MANAGE: "room.manage",
  DEPARTMENT_READ: "department.read",
  DEPARTMENT_MANAGE: "department.manage",
  USER_READ: "user.read",
  USER_MANAGE: "user.manage",
  ROLE_READ: "role.read",
  ROLE_MANAGE: "role.manage",
  PERMISSION_READ: "permission.read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** The seedable catalog: every permission key plus a human description for the `permissions` table. */
export const PERMISSION_CATALOG: readonly { key: PermissionKey; description: string }[] = [
  { key: PERMISSIONS.BRANCH_READ, description: "View branches" },
  { key: PERMISSIONS.BRANCH_MANAGE, description: "Create, update, and delete branches" },
  { key: PERMISSIONS.ROOM_READ, description: "View rooms" },
  { key: PERMISSIONS.ROOM_MANAGE, description: "Create, update, and delete rooms" },
  { key: PERMISSIONS.DEPARTMENT_READ, description: "View departments" },
  { key: PERMISSIONS.DEPARTMENT_MANAGE, description: "Create, update, and delete departments" },
  { key: PERMISSIONS.USER_READ, description: "View users" },
  {
    key: PERMISSIONS.USER_MANAGE,
    description: "Create, update, deactivate users, and assign roles",
  },
  { key: PERMISSIONS.ROLE_READ, description: "View roles and their permissions" },
  {
    key: PERMISSIONS.ROLE_MANAGE,
    description: "Create, update, delete roles and edit their grants",
  },
  { key: PERMISSIONS.PERMISSION_READ, description: "View the permission catalog" },
];

/** All permission keys, in catalog order. */
export const PERMISSION_KEYS: readonly PermissionKey[] = PERMISSION_CATALOG.map((p) => p.key);

/**
 * Per-role grant map, keyed by `roles.key`. `super_admin` gets everything; `branch_admin` manages the
 * operational resources within its branch scope (rooms/departments/users) but not branch or role
 * definitions; `staff`/`instructor` are read-mostly. Branch scoping (which branch a grant applies to)
 * is enforced separately by the Phase 6 guard via `user_roles.branchId`.
 */
export const ROLE_PERMISSION_GRANTS: Record<string, readonly PermissionKey[]> = {
  super_admin: PERMISSION_KEYS,
  branch_admin: [
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.ROOM_READ,
    PERMISSIONS.ROOM_MANAGE,
    PERMISSIONS.DEPARTMENT_READ,
    PERMISSIONS.DEPARTMENT_MANAGE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.PERMISSION_READ,
  ],
  staff: [
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.ROOM_READ,
    PERMISSIONS.DEPARTMENT_READ,
    PERMISSIONS.USER_READ,
    PERMISSIONS.PERMISSION_READ,
  ],
  instructor: [PERMISSIONS.BRANCH_READ, PERMISSIONS.ROOM_READ, PERMISSIONS.DEPARTMENT_READ],
};
