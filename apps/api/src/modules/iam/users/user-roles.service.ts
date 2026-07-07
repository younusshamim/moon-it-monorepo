// Branch-scoped role-assignment logic. A duplicate (userId, roleId, branchId) maps to ConflictError;
// an unknown role/branch (FK violation) maps to ValidationError; unassigning a missing row is a 404.
// See docs/API_AND_AUTH_PLAN.md, Phase 2.
import { NotFoundError } from "@moonit/core";
import { PERMISSIONS, type UserRole } from "@moonit/schema";
import { Injectable } from "@nestjs/common";
import type { AuthzContext } from "../../../auth/authz-context.js";
import { mapPgError } from "../../../common/db/pg-error.js";
import { UserRolesRepository } from "./user-roles.repository.js";
import { UsersService } from "./users.service.js";

@Injectable()
export class UserRolesService {
  constructor(
    private readonly repository: UserRolesRepository,
    private readonly users: UsersService,
  ) {}

  async listForUser(userId: string): Promise<UserRole[]> {
    await this.users.getById(userId); // 404 if the user is unknown
    return this.repository.listByUser(userId);
  }

  async assign(
    userId: string,
    input: { roleId: string; branchId?: string | null | undefined },
    authz: AuthzContext,
  ): Promise<UserRole> {
    // A branch-scoped admin may only assign within a branch they manage; a null (all-branch)
    // assignment requires all-branch scope (super_admin).
    authz.assertBranch(PERMISSIONS.USER_MANAGE, input.branchId ?? null);
    await this.users.getById(userId); // 404 if the user is unknown
    try {
      return await this.repository.create({
        userId,
        roleId: input.roleId,
        branchId: input.branchId ?? null,
      });
    } catch (error) {
      throw mapPgError(error, {
        conflict: "That role is already assigned for this branch",
        foreignKey: "Unknown role or branch",
      });
    }
  }

  async remove(id: string): Promise<void> {
    const deletedId = await this.repository.delete(id);
    if (!deletedId) throw new NotFoundError(`Assignment ${id} not found`);
  }
}
