// Domain 1 — Identity & Access (RBAC). Peer of @moonit/schema/iam.
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { branches } from "./organization.js";
import { id, timestamps } from "./shared.js";

export const userStatus = pgEnum("user_status", ["active", "suspended", "invited"]);

// Peer of Better Auth's core `user` model: `name` maps to `fullName`, `emailVerified` and `image`
// are Better Auth fields, and `phone`/`status` ride along as domain extras (see @moonit/auth).
// Credentials live in `accounts` (schema/auth.ts), never on the user row.
export const users = pgTable(
  "users",
  {
    id: id(),
    email: varchar({ length: 160 }).notNull(),
    phone: varchar({ length: 32 }),
    fullName: varchar({ length: 160 }).notNull(),
    status: userStatus().default("invited").notNull(),
    emailVerified: boolean().default(false).notNull(),
    image: varchar({ length: 255 }),
    ...timestamps(),
  },
  (t) => [
    // Soft-deleted users must not permanently block their email/phone from re-registration.
    uniqueIndex("users_email_live_uq").on(t.email).where(sql`${t.deletedAt} IS NULL`),
    uniqueIndex("users_phone_live_uq").on(t.phone).where(sql`${t.deletedAt} IS NULL`),
    index().on(t.createdAt),
  ],
);

export const roles = pgTable("roles", {
  id: id(),
  key: varchar({ length: 48 }).notNull().unique(), // "super_admin", "branch_admin", ...
  name: varchar({ length: 80 }).notNull(),
  isSystem: boolean().default(false).notNull(),
});

export const permissions = pgTable("permissions", {
  id: id(),
  key: varchar({ length: 80 }).notNull().unique(), // "enrollment.create", "invoice.refund"
  description: varchar({ length: 200 }),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid()
      .references(() => roles.id)
      .notNull(),
    permissionId: uuid()
      .references(() => permissions.id)
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] }), index().on(t.permissionId)],
);

export const userRoles = pgTable(
  "user_roles",
  {
    id: id(),
    userId: uuid()
      .references(() => users.id)
      .notNull(),
    roleId: uuid()
      .references(() => roles.id)
      .notNull(),
    branchId: uuid().references(() => branches.id), // null = all branches (super_admin)
    ...timestamps(),
  },
  (t) => [
    unique().on(t.userId, t.roleId, t.branchId), // no duplicate role assignment per branch
    index().on(t.userId),
    index().on(t.roleId),
    index().on(t.branchId),
    index().on(t.createdAt),
  ],
);
