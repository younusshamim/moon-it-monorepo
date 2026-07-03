// Soft-delete convention: entities carry `deletedAt` (shared `timestamps`). Reads exclude deleted rows
// and DELETE stamps `deletedAt` rather than removing the row. Join rows (user_roles, role_permissions)
// are hard-deleted and don't use this (docs/API_AND_AUTH_PLAN.md, Phase 0).
import { type Column, isNull } from "drizzle-orm";

/** Predicate filtering out soft-deleted rows: `.where(notDeleted(table.deletedAt))`. */
export const notDeleted = (deletedAt: Column) => isNull(deletedAt);
