// Drizzle access for rooms (arch-use-repository-pattern). Reads exclude soft-deleted rows and can be
// filtered by branch; DELETE stamps `deletedAt`. See docs/API_AND_AUTH_PLAN.md, Phase 1.

import { type Database, rooms } from "@moonit/db";
import type { NewRoom, Paginated, Room, UpdateRoom } from "@moonit/schema";
import { Inject, Injectable } from "@nestjs/common";
import { and, asc, type Column, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { buildPage, toLimitOffset } from "../../../common/db/pagination.js";
import { notDeleted } from "../../../common/db/soft-delete.js";
import { DRIZZLE } from "../../../database/database.tokens.js";
import type { RoomListQuery } from "./dto/room.dto.js";

@Injectable()
export class RoomsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list(query: RoomListQuery): Promise<Paginated<Room>> {
    const filters: (SQL | undefined)[] = [notDeleted(rooms.deletedAt)];
    if (query.search) filters.push(ilike(rooms.name, `%${query.search}%`));
    if (query.branchId) filters.push(eq(rooms.branchId, query.branchId));
    const where = and(...filters);
    const { limit, offset } = toLimitOffset(query);

    const [data, totals] = await Promise.all([
      this.db
        .select()
        .from(rooms)
        .where(where)
        .orderBy(this.orderBy(query))
        .limit(limit)
        .offset(offset),
      this.db.select({ total: count() }).from(rooms).where(where),
    ]);

    return buildPage(data, totals[0]?.total ?? 0, query);
  }

  async findById(id: string): Promise<Room | undefined> {
    const [row] = await this.db
      .select()
      .from(rooms)
      .where(and(eq(rooms.id, id), notDeleted(rooms.deletedAt)))
      .limit(1);
    return row;
  }

  async create(input: NewRoom): Promise<Room> {
    const [row] = await this.db.insert(rooms).values(input).returning();
    return row as Room;
  }

  async update(id: string, input: UpdateRoom): Promise<Room | undefined> {
    const [row] = await this.db
      .update(rooms)
      .set(input)
      .where(and(eq(rooms.id, id), notDeleted(rooms.deletedAt)))
      .returning();
    return row;
  }

  async softDelete(id: string): Promise<string | undefined> {
    const [row] = await this.db
      .update(rooms)
      .set({ deletedAt: new Date().toISOString() })
      .where(and(eq(rooms.id, id), notDeleted(rooms.deletedAt)))
      .returning({ id: rooms.id });
    return row?.id;
  }

  private orderBy(query: RoomListQuery): SQL {
    const columns: Record<string, Column> = {
      name: rooms.name,
      capacity: rooms.capacity,
      createdAt: rooms.createdAt,
      updatedAt: rooms.updatedAt,
    };
    const column = (query.sort ? columns[query.sort] : undefined) ?? rooms.createdAt;
    return query.order === "asc" ? asc(column) : desc(column);
  }
}
