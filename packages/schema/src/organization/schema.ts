// Domain 2 — Organization: branches, rooms, departments. See DATABASE_DOMAIN.md §1.
import { z } from "zod";
import { audit, id, timestamps } from "../shared/columns.js";

// ── Branch ──────────────────────────────────────────────────────────────────
const branchFields = {
  code: z.string().max(16), // "DHK-01" — unique
  name: z.string().max(160),
  addressLine1: z.string().max(240).nullable(),
  addressLine2: z.string().max(240).nullable(),
  city: z.string().max(80).nullable(),
  phone: z.string().max(32).nullable(),
  email: z.email().max(160).nullable(),
  timezone: z.string().max(64), // default "Asia/Dhaka"
  isActive: z.boolean(), // default true
};

export const BranchSchema = z.object({ id, ...branchFields, ...timestamps, ...audit });
export const NewBranchSchema = z.object(branchFields).partial({
  addressLine1: true,
  addressLine2: true,
  city: true,
  phone: true,
  email: true,
  timezone: true,
  isActive: true,
});
export const UpdateBranchSchema = NewBranchSchema.partial();

export type Branch = z.infer<typeof BranchSchema>;
export type NewBranch = z.infer<typeof NewBranchSchema>;
export type UpdateBranch = z.infer<typeof UpdateBranchSchema>;

// ── Room ────────────────────────────────────────────────────────────────────
const roomFields = {
  branchId: z.uuid(),
  name: z.string().max(80), // "Lab 1", "Room 204"
  capacity: z.number().int().positive(),
  hasComputers: z.boolean(), // default false
  isActive: z.boolean(), // default true
};

export const RoomSchema = z.object({ id, ...roomFields, ...timestamps, ...audit });
export const NewRoomSchema = z.object(roomFields).partial({
  hasComputers: true,
  isActive: true,
});
export const UpdateRoomSchema = NewRoomSchema.partial();

export type Room = z.infer<typeof RoomSchema>;
export type NewRoom = z.infer<typeof NewRoomSchema>;
export type UpdateRoom = z.infer<typeof UpdateRoomSchema>;

// ── Department ────────────────────────────────────────────────────────────────
const departmentFields = {
  branchId: z.uuid().nullable(), // null = institute-wide
  name: z.string().max(120), // "IT", "Languages", "Diploma"
};

export const DepartmentSchema = z.object({ id, ...departmentFields, ...timestamps, ...audit });
export const NewDepartmentSchema = z.object(departmentFields).partial({ branchId: true });
export const UpdateDepartmentSchema = NewDepartmentSchema.partial();

export type Department = z.infer<typeof DepartmentSchema>;
export type NewDepartment = z.infer<typeof NewDepartmentSchema>;
export type UpdateDepartment = z.infer<typeof UpdateDepartmentSchema>;
