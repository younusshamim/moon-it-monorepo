// Domain 2 — Organization: branches, rooms, departments. Peer of @moonit/schema/organization.
import { boolean, index, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { audit, id, timestamps } from "./shared.js";

export const branches = pgTable("branches", {
  id: id(),
  code: varchar({ length: 16 }).notNull().unique(), // "DHK-01"
  name: varchar({ length: 160 }).notNull(),
  addressLine1: varchar({ length: 240 }),
  addressLine2: varchar({ length: 240 }),
  city: varchar({ length: 80 }),
  phone: varchar({ length: 32 }),
  email: varchar({ length: 160 }),
  timezone: varchar({ length: 64 }).default("Asia/Dhaka").notNull(),
  isActive: boolean().default(true).notNull(),
  ...timestamps(),
  ...audit(),
});

export const rooms = pgTable(
  "rooms",
  {
    id: id(),
    branchId: uuid()
      .references(() => branches.id)
      .notNull(),
    name: varchar({ length: 80 }).notNull(), // "Lab 1", "Room 204"
    capacity: integer().notNull(),
    hasComputers: boolean().default(false).notNull(),
    isActive: boolean().default(true).notNull(),
    ...timestamps(),
  },
  (t) => [index().on(t.branchId), index().on(t.createdAt)],
);

export const departments = pgTable(
  "departments",
  {
    id: id(),
    branchId: uuid().references(() => branches.id), // null = institute-wide
    name: varchar({ length: 120 }).notNull(), // "IT", "Languages", "Diploma"
    ...timestamps(),
  },
  (t) => [index().on(t.branchId), index().on(t.createdAt)],
);
