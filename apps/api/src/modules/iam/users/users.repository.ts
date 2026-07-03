// Drizzle access for users (arch-use-repository-pattern). Reads exclude soft-deleted rows. Credentials
// are never stored here (Better Auth `accounts`, Phase 4). See docs/API_AND_AUTH_PLAN.md, Phase 2.

import { type Database, users } from "@moonit/db";
import type { NewUser, Paginated, UpdateUser, User } from "@moonit/schema";
import { Inject, Injectable } from "@nestjs/common";
import { and, asc, type Column, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { buildPage, toLimitOffset } from "../../../common/db/pagination.js";
import { notDeleted } from "../../../common/db/soft-delete.js";
import { DRIZZLE } from "../../../database/database.tokens.js";
import type { UserListQuery } from "./dto/user.dto.js";

@Injectable()
export class UsersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list(query: UserListQuery): Promise<Paginated<User>> {
    const filters: (SQL | undefined)[] = [notDeleted(users.deletedAt)];
    if (query.search) {
      const term = `%${query.search}%`;
      filters.push(
        or(ilike(users.fullName, term), ilike(users.email, term), ilike(users.phone, term)),
      );
    }
    if (query.status) filters.push(eq(users.status, query.status));
    const where = and(...filters);
    const { limit, offset } = toLimitOffset(query);

    const [data, totals] = await Promise.all([
      this.db
        .select()
        .from(users)
        .where(where)
        .orderBy(this.orderBy(query))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(users).where(where),
    ]);

    return buildPage(data, totals[0]?.total ?? 0, query);
  }

  async findById(id: string): Promise<User | undefined> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), notDeleted(users.deletedAt)))
      .limit(1);
    return row;
  }

  async create(input: NewUser): Promise<User> {
    const [row] = await this.db.insert(users).values(input).returning();
    return row as User;
  }

  async update(id: string, input: UpdateUser): Promise<User | undefined> {
    const [row] = await this.db
      .update(users)
      .set(input)
      .where(and(eq(users.id, id), notDeleted(users.deletedAt)))
      .returning();
    return row;
  }

  private orderBy(query: UserListQuery): SQL {
    const columns: Record<string, Column> = {
      fullName: users.fullName,
      email: users.email,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    };
    const column = (query.sort ? columns[query.sort] : undefined) ?? users.createdAt;
    return query.order === "asc" ? asc(column) : desc(column);
  }
}
