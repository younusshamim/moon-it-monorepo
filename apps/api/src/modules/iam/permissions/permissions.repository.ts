// Drizzle access for permissions (arch-use-repository-pattern). The catalog has no soft-delete column;
// this phase only reads it. See docs/API_AND_AUTH_PLAN.md, Phase 2.

import { type Database, permissions } from "@moonit/db";
import type { Permission } from "@moonit/schema";
import { Inject, Injectable } from "@nestjs/common";
import { asc } from "drizzle-orm";
import { DRIZZLE } from "../../../database/database.tokens.js";

@Injectable()
export class PermissionsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /** The full catalog, ordered by key. */
  list(): Promise<Permission[]> {
    return this.db.select().from(permissions).orderBy(asc(permissions.key));
  }
}
