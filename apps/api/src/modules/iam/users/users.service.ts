// User domain logic. Creation provisions the domain row as `invited` (no password — credentials belong
// to Better Auth, Phase 4). Unique email/phone map to ConflictError; deactivation flips status to
// `suspended` rather than deleting. See docs/API_AND_AUTH_PLAN.md, Phase 2.
import { NotFoundError } from "@moonit/core";
import type { NewUser, Paginated, UpdateUser, User } from "@moonit/schema";
import { Injectable } from "@nestjs/common";
import { mapPgError } from "../../../common/db/pg-error.js";
import type { UserListQuery } from "./dto/user.dto.js";
import { UsersRepository } from "./users.repository.js";

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  list(query: UserListQuery): Promise<Paginated<User>> {
    return this.repository.list(query);
  }

  async getById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }

  async create(input: NewUser): Promise<User> {
    try {
      // A freshly provisioned user has no credential yet — it starts as `invited` regardless of input.
      return await this.repository.create({ ...input, status: "invited" });
    } catch (error) {
      throw mapPgError(error, { conflict: "A user with that email or phone already exists" });
    }
  }

  async update(id: string, input: UpdateUser): Promise<User> {
    let user: User | undefined;
    try {
      user = await this.repository.update(id, input);
    } catch (error) {
      throw mapPgError(error, { conflict: "A user with that email or phone already exists" });
    }
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.repository.deactivate(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }
}
