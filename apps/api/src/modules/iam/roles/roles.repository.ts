// Drizzle access for roles and their permission grants (arch-use-repository-pattern). Roles carry no
// soft-delete column, so DELETE is a hard delete; the `role_permissions` join is hard-deleted too.
// Replacing a grant set runs in a transaction (db-use-transactions). See Phase 2.

import { type Database, permissions, rolePermissions, roles } from "@moonit/db";
import type { NewRole, Permission, Role, UpdateRole } from "@moonit/schema";
import { Inject, Injectable } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE } from "../../../database/database.tokens.js";

@Injectable()
export class RolesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  list(): Promise<Role[]> {
    return this.db.select().from(roles).orderBy(asc(roles.name));
  }

  async findById(id: string): Promise<Role | undefined> {
    const [row] = await this.db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return row;
  }

  async create(input: NewRole): Promise<Role> {
    const [row] = await this.db.insert(roles).values(input).returning();
    return row as Role;
  }

  async update(id: string, input: UpdateRole): Promise<Role | undefined> {
    const [row] = await this.db.update(roles).set(input).where(eq(roles.id, id)).returning();
    return row;
  }

  /** Hard delete; returns the id when a row matched, else undefined. */
  async delete(id: string): Promise<string | undefined> {
    const [row] = await this.db.delete(roles).where(eq(roles.id, id)).returning({ id: roles.id });
    return row?.id;
  }

  /** The permissions currently granted to a role, ordered by key. */
  listPermissions(roleId: string): Promise<Permission[]> {
    return this.db
      .select({ id: permissions.id, key: permissions.key, description: permissions.description })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId))
      .orderBy(asc(permissions.key));
  }

  /** Replace a role's entire grant set in one transaction, then return the new set. */
  async replacePermissions(roleId: string, permissionIds: string[]): Promise<Permission[]> {
    return this.db.transaction(async (tx) => {
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
      if (permissionIds.length > 0) {
        await tx
          .insert(rolePermissions)
          .values(permissionIds.map((permissionId) => ({ roleId, permissionId })));
      }
      return tx
        .select({ id: permissions.id, key: permissions.key, description: permissions.description })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, roleId))
        .orderBy(asc(permissions.key));
    });
  }
}
