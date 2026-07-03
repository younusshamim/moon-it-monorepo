// Drizzle access for branch-scoped role assignments (the `user_roles` join). Per the delete-semantics
// decision, join rows are HARD-deleted (not soft). The unique(userId, roleId, branchId) constraint is
// enforced by the DB and surfaced as a ConflictError by the service. See Phase 2 & Resolved decision #1.

import { type Database, userRoles } from "@moonit/db";
import type { NewUserRole, UserRole } from "@moonit/schema";
import { Inject, Injectable } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../../database/database.tokens.js";

@Injectable()
export class UserRolesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /** A user's role assignments, ordered by creation. */
  listByUser(userId: string): Promise<UserRole[]> {
    return this.db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(userRoles.createdAt));
  }

  async create(input: NewUserRole): Promise<UserRole> {
    const [row] = await this.db.insert(userRoles).values(input).returning();
    return row as UserRole;
  }

  /** Hard delete by assignment id; returns the id when a row matched, else undefined. */
  async delete(id: string): Promise<string | undefined> {
    const [row] = await this.db
      .delete(userRoles)
      .where(eq(userRoles.id, id))
      .returning({ id: userRoles.id });
    return row?.id;
  }
}
