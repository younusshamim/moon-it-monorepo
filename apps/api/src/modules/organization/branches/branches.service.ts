// Branch domain logic. Throws @moonit/core domain errors at failures; the global DomainExceptionFilter
// maps them to HTTP status. Translates DB unique violations (duplicate `code`) into ConflictError via
// mapPgError. Writes stamp the `createdBy`/`updatedBy` audit columns with the authenticated user id
// (`actorId`), threaded from `@CurrentUser()`. See docs/API_AND_AUTH_PLAN.md, Phase 5.
import { NotFoundError } from "@moonit/core";
import type { Branch, NewBranch, Paginated, PaginationQuery, UpdateBranch } from "@moonit/schema";
import { Injectable } from "@nestjs/common";
import { mapPgError } from "../../../common/db/pg-error.js";
import { BranchesRepository } from "./branches.repository.js";

@Injectable()
export class BranchesService {
  constructor(private readonly repository: BranchesRepository) {}

  list(query: PaginationQuery): Promise<Paginated<Branch>> {
    return this.repository.list(query);
  }

  async getById(id: string): Promise<Branch> {
    const branch = await this.repository.findById(id);
    if (!branch) throw new NotFoundError(`Branch ${id} not found`);
    return branch;
  }

  async create(input: NewBranch, actorId: string): Promise<Branch> {
    try {
      return await this.repository.create(input, actorId);
    } catch (error) {
      throw mapPgError(error, { conflict: `Branch code "${input.code}" already exists` });
    }
  }

  async update(id: string, input: UpdateBranch, actorId: string): Promise<Branch> {
    let branch: Branch | undefined;
    try {
      branch = await this.repository.update(id, input, actorId);
    } catch (error) {
      throw mapPgError(error, { conflict: "Branch code already exists" });
    }
    if (!branch) throw new NotFoundError(`Branch ${id} not found`);
    return branch;
  }

  async remove(id: string, actorId: string): Promise<void> {
    const deletedId = await this.repository.softDelete(id, actorId);
    if (!deletedId) throw new NotFoundError(`Branch ${id} not found`);
  }
}
