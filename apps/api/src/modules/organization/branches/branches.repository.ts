// Drizzle access for branches, isolated here so the service stays testable (arch-use-repository-pattern).
// Reads exclude soft-deleted rows; DELETE stamps `deletedAt`. Writes stamp the `createdBy`/`updatedBy`
// audit columns with the authenticated user id (`actorId`). See docs/API_AND_AUTH_PLAN.md, Phase 5.

import { branches, type Database } from "@moonit/db";
import type { Branch, NewBranch, Paginated, PaginationQuery, UpdateBranch } from "@moonit/schema";
import { Inject, Injectable } from "@nestjs/common";
import { and, asc, type Column, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { buildPage, toLimitOffset } from "../../../common/db/pagination.js";
import { notDeleted } from "../../../common/db/soft-delete.js";
import { DRIZZLE } from "../../../database/database.tokens.js";

@Injectable()
export class BranchesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list(query: PaginationQuery): Promise<Paginated<Branch>> {
    const filters: (SQL | undefined)[] = [notDeleted(branches.deletedAt)];
    if (query.search) {
      const term = `%${query.search}%`;
      filters.push(or(ilike(branches.code, term), ilike(branches.name, term)));
    }
    const where = and(...filters);
    const { limit, offset } = toLimitOffset(query);

    const [rows, totals] = await Promise.all([
      this.db
        .select()
        .from(branches)
        .where(where)
        .orderBy(this.orderBy(query))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(branches).where(where),
    ]);

    return buildPage(rows, totals[0]?.total ?? 0, query);
  }

  async findById(id: string): Promise<Branch | undefined> {
    const [row] = await this.db
      .select()
      .from(branches)
      .where(and(eq(branches.id, id), notDeleted(branches.deletedAt)))
      .limit(1);
    return row;
  }

  async create(input: NewBranch, actorId: string): Promise<Branch> {
    const [row] = await this.db
      .insert(branches)
      .values({ ...input, createdBy: actorId, updatedBy: actorId })
      .returning();
    return row as Branch;
  }

  async update(id: string, input: UpdateBranch, actorId: string): Promise<Branch | undefined> {
    const [row] = await this.db
      .update(branches)
      .set({ ...input, updatedBy: actorId })
      .where(and(eq(branches.id, id), notDeleted(branches.deletedAt)))
      .returning();
    return row;
  }

  /** Soft-delete: stamp `deletedAt` + the actor. Returns the id when a live row matched, else undefined. */
  async softDelete(id: string, actorId: string): Promise<string | undefined> {
    const [row] = await this.db
      .update(branches)
      .set({ deletedAt: new Date().toISOString(), updatedBy: actorId })
      .where(and(eq(branches.id, id), notDeleted(branches.deletedAt)))
      .returning({ id: branches.id });
    return row?.id;
  }

  /** Whitelisted sort columns (default `createdAt`) with the requested direction. */
  private orderBy(query: PaginationQuery): SQL {
    const columns: Record<string, Column> = {
      code: branches.code,
      name: branches.name,
      createdAt: branches.createdAt,
      updatedAt: branches.updatedAt,
    };
    const column = (query.sort ? columns[query.sort] : undefined) ?? branches.createdAt;
    return query.order === "asc" ? asc(column) : desc(column);
  }
}
