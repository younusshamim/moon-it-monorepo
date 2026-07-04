// The authenticated principal the web shell reads from `GET /v1/me`: identity plus the RBAC data the
// UI needs to mirror server-side checks — the user's role assignments (with branch scope), their
// effective permission keys, and the set of branches they can act on. Better Auth's own session
// carries only identity, so the API enriches it from `user_roles → role_permissions` here.
//
// This is the *display/gating* contract (never the security boundary — every mutation is still
// authorized server-side). Authored in the zero-dependency contract package so the API response DTO
// and the web parser derive the same shape.
import { z } from "zod";
import { PERMISSION_KEYS, type PermissionKey } from "../iam/rbac.js";
import { id } from "../shared/columns.js";

/** A permission key from the RBAC catalog (`branch.read`, `user.manage`, …). */
export const PermissionKeySchema = z.enum(
  PERMISSION_KEYS as unknown as [PermissionKey, ...PermissionKey[]],
);

/** One role assignment: the role key and the branch it applies to (`null` = all branches). */
export const SessionRoleSchema = z.object({
  role: z.string(),
  branchId: id.nullable(),
});
export type SessionRole = z.infer<typeof SessionRoleSchema>;

/**
 * The current user as the dashboard shell sees them. `branchScope: null` means "all branches"
 * (a null-scoped assignment such as super_admin); otherwise it is the distinct set of branch ids the
 * user is assigned to. `permissions` is the flattened, de-duplicated set of keys the user holds in at
 * least one scope — enough to gate UI affordances; fine-grained branch checks stay server-side.
 */
export const SessionUserSchema = z.object({
  id,
  email: z.email(),
  name: z.string(),
  roles: z.array(SessionRoleSchema),
  permissions: z.array(PermissionKeySchema),
  branchScope: z.array(id).nullable(),
});
export type SessionUser = z.infer<typeof SessionUserSchema>;
