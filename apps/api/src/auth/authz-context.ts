// The per-request authorization context: the caller's effective permission grants plus the
// `super_admin` flag, with the branch-scope logic that services use to gate writes. Built by the
// PermissionsGuard (from the DB grant join) and attached to the request; read via `@Authz()`.
//
// A grant is one (permission, branch) pair: `branchId === null` means the permission applies to *all*
// branches (super_admin, or an institute-wide assignment). The guard checks the coarse key; services
// call `assertBranch` with the target resource's branch for the fine-grained check.
// See docs/API_AND_AUTH_PLAN.md Phase 6.
import { ForbiddenError } from "@moonit/core";
import type { PermissionKey } from "@moonit/schema";

/** One effective grant: a permission key and the branch it applies to (`null` = all branches). */
export interface PermissionGrant {
  permission: string;
  branchId: string | null;
}

export class AuthzContext {
  constructor(
    private readonly isSuperAdmin: boolean,
    private readonly grants: readonly PermissionGrant[],
  ) {}

  /** Does the caller hold this permission in at least one scope? (super_admin holds everything.) */
  has(permission: PermissionKey): boolean {
    if (this.isSuperAdmin) return true;
    return this.grants.some((g) => g.permission === permission);
  }

  /**
   * Is the caller allowed to act on a resource in `resourceBranchId` under `permission`? Allowed when
   * super_admin, or a grant for the permission spans all branches (`branchId === null`), or a grant
   * matches the resource's branch. An institute-wide resource (`resourceBranchId === null`) requires a
   * null-scope grant, so a branch-scoped caller is correctly denied. Throws ForbiddenError otherwise.
   */
  assertBranch(permission: PermissionKey, resourceBranchId: string | null): void {
    if (this.isSuperAdmin) return;

    for (const grant of this.grants) {
      if (grant.permission !== permission) continue;
      if (grant.branchId === null) return; // all-branch scope covers any resource
      if (resourceBranchId !== null && grant.branchId === resourceBranchId) return;
    }

    throw new ForbiddenError("You do not have access to this branch");
  }
}

/** A context that allows everything — for super_admin callers (no grant load needed). */
export function superAdminContext(): AuthzContext {
  return new AuthzContext(true, []);
}
