// Domain 9 (HR/Staff) — employees and instructors. Peer of @moonit/schema/hr.
import { date, index, jsonb, numeric, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./iam.js";
import { branches } from "./organization.js";
import { id, timestamps } from "./shared.js";

export const employeeStatus = pgEnum("employee_status", ["active", "on_leave", "terminated"]);

export const employees = pgTable(
  "employees",
  {
    id: id(),
    userId: uuid().references(() => users.id),
    branchId: uuid()
      .references(() => branches.id)
      .notNull(),
    employeeCode: varchar({ length: 24 }).notNull().unique(),
    fullName: varchar({ length: 160 }).notNull(),
    designation: varchar({ length: 80 }),
    phone: varchar({ length: 32 }),
    status: employeeStatus().default("active").notNull(),
    joinedAt: date(),
    ...timestamps(),
  },
  (t) => [index().on(t.userId), index().on(t.branchId), index().on(t.createdAt)],
);

export const instructors = pgTable(
  "instructors",
  {
    id: id(),
    employeeId: uuid().references(() => employees.id), // staff instructors
    userId: uuid().references(() => users.id), // or guest/freelance
    fullName: varchar({ length: 160 }).notNull(),
    expertise: jsonb().$type<string[]>(), // ["React", "IELTS"]
    bio: varchar({ length: 600 }),
    ratePerSession: numeric({ precision: 12, scale: 2 }), // freelance
    ...timestamps(),
  },
  (t) => [index().on(t.employeeId), index().on(t.userId), index().on(t.createdAt)],
);
