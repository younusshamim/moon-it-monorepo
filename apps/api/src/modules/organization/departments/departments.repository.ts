// Drizzle access for departments (arch-use-repository-pattern). Reads exclude soft-deleted rows and can
// be filtered by branch; DELETE stamps `deletedAt`. See docs/API_AND_AUTH_PLAN.md, Phase 1.

import { type Database, departments } from "@moonit/db";
import type { Department, NewDepartment, Paginated, UpdateDepartment } from "@moonit/schema";
import { Inject, Injectable } from "@nestjs/common";
import { and, asc, type Column, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { buildPage, toLimitOffset } from "../../../common/db/pagination.js";
import { notDeleted } from "../../../common/db/soft-delete.js";
import { DRIZZLE } from "../../../database/database.tokens.js";
import type { DepartmentListQuery } from "./dto/department.dto.js";

@Injectable()
export class DepartmentsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list(query: DepartmentListQuery): Promise<Paginated<Department>> {
    const filters: (SQL | undefined)[] = [notDeleted(departments.deletedAt)];
    if (query.search) filters.push(ilike(departments.name, `%${query.search}%`));
    if (query.branchId) filters.push(eq(departments.branchId, query.branchId));
    const where = and(...filters);
    const { limit, offset } = toLimitOffset(query);

    const [data, totals] = await Promise.all([
      this.db
        .select()
        .from(departments)
        .where(where)
        .orderBy(this.orderBy(query))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(departments).where(where),
    ]);

    return buildPage(data, totals[0]?.total ?? 0, query);
  }

  async findById(id: string): Promise<Department | undefined> {
    const [row] = await this.db
      .select()
      .from(departments)
      .where(and(eq(departments.id, id), notDeleted(departments.deletedAt)))
      .limit(1);
    return row;
  }

  async create(input: NewDepartment): Promise<Department> {
    const [row] = await this.db.insert(departments).values(input).returning();
    return row as Department;
  }

  async update(id: string, input: UpdateDepartment): Promise<Department | undefined> {
    const [row] = await this.db
      .update(departments)
      .set(input)
      .where(and(eq(departments.id, id), notDeleted(departments.deletedAt)))
      .returning();
    return row;
  }

  async softDelete(id: string): Promise<string | undefined> {
    const [row] = await this.db
      .update(departments)
      .set({ deletedAt: new Date().toISOString() })
      .where(and(eq(departments.id, id), notDeleted(departments.deletedAt)))
      .returning({ id: departments.id });
    return row?.id;
  }

  private orderBy(query: DepartmentListQuery): SQL {
    const columns: Record<string, Column> = {
      name: departments.name,
      createdAt: departments.createdAt,
      updatedAt: departments.updatedAt,
    };
    const column = (query.sort ? columns[query.sort] : undefined) ?? departments.createdAt;
    return query.order === "asc" ? asc(column) : desc(column);
  }
}
