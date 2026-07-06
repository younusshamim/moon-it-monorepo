// Domain 5 (people) — Students. Peer of @moonit/schema/people. Soft-deletable + audited.
import { sql } from "drizzle-orm";
import {
  date,
  index,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./iam.js";
import { branches } from "./organization.js";
import { audit, id, timestamps } from "./shared.js";

export const gender = pgEnum("gender", ["male", "female", "other"]);

export const students = pgTable(
  "students",
  {
    id: id(),
    userId: uuid().references(() => users.id), // null if no portal login
    homeBranchId: uuid()
      .references(() => branches.id)
      .notNull(),
    studentCode: varchar({ length: 24 }).notNull(), // "MIT-2026-00142"
    fullName: varchar({ length: 160 }).notNull(),
    phone: varchar({ length: 32 }).notNull(),
    email: varchar({ length: 160 }),
    gender: gender(),
    dateOfBirth: date(),
    nidOrBirthCert: varchar({ length: 40 }),
    guardianName: varchar({ length: 160 }),
    guardianPhone: varchar({ length: 32 }),
    address: text(),
    photoUrl: varchar({ length: 400 }),
    ...timestamps(),
    ...audit(),
  },
  (t) => [
    // A soft-deleted student shouldn't permanently block reusing their student code.
    uniqueIndex("students_studentCode_live_uq")
      .on(t.studentCode)
      .where(sql`${t.deletedAt} IS NULL`),
    index().on(t.userId),
    index().on(t.homeBranchId),
    index().on(t.createdAt),
  ],
);
