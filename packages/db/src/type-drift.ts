// @moonit/schema is the *authored* source of truth for every wire contract; the Drizzle tables here
// are hand-written peers that "must conform". This file turns that rule from a comment into a
// compiler check: for each entity it asserts that the Drizzle select-row type is *identical* to the
// Zod entity type. Rename a field, flip a nullability, or add a column on only one side and
// `tsc --noEmit` fails here — instead of the mismatch reaching runtime (or worse, only prod, where
// response validation is off).
//
// This module has **no runtime exports** and is imported nowhere; it exists solely to be typechecked
// (it's under `src`, so `pnpm --filter @moonit/db typecheck` and `build` both cover it).
//
// Adding a domain: when a new domain gains an API (its repository/endpoints ship), add its
// entity/table pair below. If the two sides differ *by design* (e.g. a DB-only column not on the
// wire), narrow the assertion with `Omit<...>` and a one-line comment explaining why — never loosen
// the check silently. Timestamps are `string` on both sides (Zod `isoDateTime()` output ↔ the
// `isoTimestamp` custom column), so the comparison is exact.

import type {
  Branch,
  Department,
  Permission,
  Role,
  RolePermission,
  Room,
  User,
  UserRole,
} from "@moonit/schema";
import type { InferSelectModel } from "drizzle-orm";
import type { permissions, rolePermissions, roles, userRoles, users } from "./schema/iam.js";
import type { branches, departments, rooms } from "./schema/organization.js";

/** True iff `A` and `B` are the exact same type (invariant — catches nullability/optionality drift). */
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/** Compile error unless `T` is exactly `true`. */
type Expect<T extends true> = T;

// ── Organization ──────────────────────────────────────────────────────────────
export type _BranchDrift = Expect<Equal<InferSelectModel<typeof branches>, Branch>>;
export type _RoomDrift = Expect<Equal<InferSelectModel<typeof rooms>, Room>>;
export type _DepartmentDrift = Expect<Equal<InferSelectModel<typeof departments>, Department>>;

// ── IAM ───────────────────────────────────────────────────────────────────────
export type _UserDrift = Expect<Equal<InferSelectModel<typeof users>, User>>;
export type _RoleDrift = Expect<Equal<InferSelectModel<typeof roles>, Role>>;
export type _PermissionDrift = Expect<Equal<InferSelectModel<typeof permissions>, Permission>>;
export type _RolePermissionDrift = Expect<
  Equal<InferSelectModel<typeof rolePermissions>, RolePermission>
>;
export type _UserRoleDrift = Expect<Equal<InferSelectModel<typeof userRoles>, UserRole>>;
