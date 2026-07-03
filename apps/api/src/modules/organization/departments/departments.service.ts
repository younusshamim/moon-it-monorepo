// Department domain logic. Throws @moonit/core domain errors; the DomainExceptionFilter maps to HTTP.
// See docs/API_AND_AUTH_PLAN.md, Phase 1.
import { NotFoundError } from "@moonit/core";
import type { Department, NewDepartment, Paginated, UpdateDepartment } from "@moonit/schema";
import { Injectable } from "@nestjs/common";
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

  async create(input: NewDepartment): Promise<Department> {
    try {
      return await this.repository.create(input);
    } catch (error) {
      throw mapPgError(error, { conflict: "Department already exists" });
    }
  }

  async update(id: string, input: UpdateDepartment): Promise<Department> {
    let department: Department | undefined;
    try {
      department = await this.repository.update(id, input);
    } catch (error) {
      throw mapPgError(error, { conflict: "Department already exists" });
    }
    if (!department) throw new NotFoundError(`Department ${id} not found`);
    return department;
  }

  async remove(id: string): Promise<void> {
    const deletedId = await this.repository.softDelete(id);
    if (!deletedId) throw new NotFoundError(`Department ${id} not found`);
  }
}
