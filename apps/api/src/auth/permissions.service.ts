// Loads a user's effective permission grants: joins `user_roles → role_permissions → permissions`,
// carrying each assignment's branch scope. The DB is the runtime source of truth, so edits via
// `PUT /roles/:id/permissions` take effect immediately (the static ROLE_PERMISSION_GRANTS map in
// @moonit/schema is only the seed default). Isolated from the guard so the query is unit-testable and
// so per-request caching (Redis, later) can land in one place. See docs/API_AND_AUTH_PLAN.md Phase 6.
import { type Database, permissions, rolePermissions, userRoles } from "@moonit/db";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../database/database.tokens.js";
import type { PermissionGrant } from "./authz-context.js";

@Injectable()
export class PermissionsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /** Every (permission key, branch scope) pair the user holds via their role assignments. */
  async loadGrants(userId: string): Promise<PermissionGrant[]> {
    return this.db
      .selectDistinct({ permission: permissions.key, branchId: userRoles.branchId })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(eq(userRoles.userId, userId));
  }
}
