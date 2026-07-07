// Role domain logic. System roles (`isSystem`) are read-only: update/delete throw ForbiddenError (403),
// protecting the seeded RBAC baseline. Duplicate keys map to ConflictError. Permission-set replacement
// is allowed for any existing role (only the role row itself is protected). See Phase 2.
import { ForbiddenError, NotFoundError } from "@moonit/core";
import type { NewRole, Permission, Role, UpdateRole } from "@moonit/schema";
import { Injectable } from "@nestjs/common";
import { mapPgError } from "../../../common/db/pg-error.js";
import { RolesRepository } from "./roles.repository.js";

@Injectable()
export class RolesService {
  constructor(private readonly repository: RolesRepository) {}

  list(): Promise<Role[]> {
    return this.repository.list();
  }

  async getById(id: string): Promise<Role> {
    const role = await this.repository.findById(id);
    if (!role) throw new NotFoundError(`Role ${id} not found`);
    return role;
  }

  async create(input: NewRole): Promise<Role> {
    try {
      return await this.repository.create(input);
    } catch (error) {
      throw mapPgError(error, { conflict: `Role key "${input.key}" already exists` });
    }
  }

  async update(id: string, input: UpdateRole): Promise<Role> {
    const existing = await this.getById(id);
    if (existing.isSystem) throw new ForbiddenError("System roles cannot be modified");
    let role: Role | undefined;
    try {
      role = await this.repository.update(id, input);
    } catch (error) {
      throw mapPgError(error, { conflict: "Role key already exists" });
    }
    if (!role) throw new NotFoundError(`Role ${id} not found`);
    return role;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (existing.isSystem) throw new ForbiddenError("System roles cannot be deleted");
    await this.repository.delete(id);
  }

  async listPermissions(roleId: string): Promise<Permission[]> {
    await this.getById(roleId); // 404 if the role is unknown
    return this.repository.listPermissions(roleId);
  }

  async replacePermissions(roleId: string, permissionIds: string[]): Promise<Permission[]> {
    await this.getById(roleId); // 404 if the role is unknown
    try {
      return await this.repository.replacePermissions(roleId, permissionIds);
    } catch (error) {
      throw mapPgError(error, { foreignKey: "One or more permission ids do not exist" });
    }
  }
}
