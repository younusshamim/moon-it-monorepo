// Department domain logic. Throws @moonit/core domain errors; the DomainExceptionFilter maps to HTTP.
// Writes are branch-scoped: the caller's AuthzContext must allow `department.manage` on the target
// branch. An institute-wide department (`branchId === null`) needs all-branch scope (Phase 6). Phase 1.
import { NotFoundError } from "@moonit/core";
import {
  type Department,
  type NewDepartment,
  type Paginated,
  PERMISSIONS,
  type UpdateDepartment,
} from "@moonit/schema";
import { Injectable } from "@nestjs/common";
import type { AuthzContext } from "../../../auth/authz-context.js";
import { mapPgError } from "../../../common/db/pg-error.js";
import { DepartmentsRepository } from "./departments.repository.js";
import type { DepartmentListQuery } from "./dto/department.dto.js";

@Injectable()
export class DepartmentsService {
  constructor(private readonly repository: DepartmentsRepository) {}

  list(query: DepartmentListQuery): Promise<Paginated<Department>> {
    return this.repository.list(query);
  }

  async getById(id: string): Promise<Department> {
    const department = await this.repository.findById(id);
    if (!department) throw new NotFoundError(`Department ${id} not found`);
    return department;
  }

  async create(input: NewDepartment, authz: AuthzContext, actorId: string): Promise<Department> {
    authz.assertBranch(PERMISSIONS.DEPARTMENT_MANAGE, input.branchId ?? null);
    try {
      return await this.repository.create(input, actorId);
    } catch (error) {
      throw mapPgError(error, { conflict: "Department already exists" });
    }
  }

  async update(
    id: string,
    input: UpdateDepartment,
    authz: AuthzContext,
    actorId: string,
  ): Promise<Department> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError(`Department ${id} not found`);
    authz.assertBranch(PERMISSIONS.DEPARTMENT_MANAGE, existing.branchId);
    // Moving a department to a different branch requires access to the target branch too.
    if (input.branchId !== undefined && input.branchId !== existing.branchId) {
      authz.assertBranch(PERMISSIONS.DEPARTMENT_MANAGE, input.branchId ?? null);
    }

    let department: Department | undefined;
    try {
      department = await this.repository.update(id, input, actorId);
    } catch (error) {
      throw mapPgError(error, { conflict: "Department already exists" });
    }
    if (!department) throw new NotFoundError(`Department ${id} not found`);
    return department;
  }

  async remove(id: string, authz: AuthzContext, actorId: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError(`Department ${id} not found`);
    authz.assertBranch(PERMISSIONS.DEPARTMENT_MANAGE, existing.branchId);

    const deletedId = await this.repository.softDelete(id, actorId);
    if (!deletedId) throw new NotFoundError(`Department ${id} not found`);
  }
}
