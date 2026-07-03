// Branch-scoped role-assignment logic. A duplicate (userId, roleId, branchId) maps to ConflictError;
// an unknown role/branch (FK violation) maps to ValidationError; unassigning a missing row is a 404.
// See docs/API_AND_AUTH_PLAN.md, Phase 2.
import { ConflictError, NotFoundError, ValidationError } from "@moonit/core";
import type { UserRole } from "@moonit/schema";
import { Injectable } from "@nestjs/common";
import { UserRolesRepository } from "./user-roles.repository.js";
import { UsersService } from "./users.service.js";

const UNIQUE_VIOLATION = "23505";
const FK_VIOLATION = "23503";

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
  ): Promise<UserRole> {
    await this.users.getById(userId); // 404 if the user is unknown
    try {
      return await this.repository.create({
        userId,
        roleId: input.roleId,
        branchId: input.branchId ?? null,
      });
    } catch (error) {
      if (isPgError(error)) {
        if (error.code === UNIQUE_VIOLATION) {
          throw new ConflictError("That role is already assigned for this branch");
        }
        if (error.code === FK_VIOLATION) {
          throw new ValidationError("Unknown role or branch");
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const deletedId = await this.repository.delete(id);
    if (!deletedId) throw new NotFoundError(`Assignment ${id} not found`);
  }
}

function isPgError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}
