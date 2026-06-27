// Domain 1 — Identity & Access (RBAC). Peer of @moonit/schema/iam.
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { branches } from "./organization.js";
import { id, timestamps } from "./shared.js";

export const userStatus = pgEnum("user_status", ["active", "suspended", "invited"]);

export const users = pgTable(
  "users",
  {
    id: id(),
    email: varchar({ length: 160 }).notNull().unique(),
    phone: varchar({ length: 32 }).unique(),
    passwordHash: varchar({ length: 255 }),
    fullName: varchar({ length: 160 }).notNull(),
    status: userStatus().default("invited").notNull(),
    emailVerifiedAt: timestamp({ withTimezone: true, mode: "string" }),
    ...timestamps(),
  },
  (t) => [index().on(t.createdAt)],
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
    index().on(t.userId),
    index().on(t.roleId),
    index().on(t.branchId),
    index().on(t.createdAt),
  ],
);
