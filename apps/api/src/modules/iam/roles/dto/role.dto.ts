// nestjs-zod DTOs for the roles endpoints. Bodies wrap @moonit/schema; roles are a small fixed set so
// the list is a bare array. The permission-set replacement body is a request-only shape (a list of
// permission ids), so it is authored locally rather than as an entity contract.
import { NewRoleSchema, PermissionSchema, RoleSchema, UpdateRoleSchema } from "@moonit/schema";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class CreateRoleDto extends createZodDto(NewRoleSchema) {}
export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}

/** Single-role response. */
export class RoleDto extends createZodDto(RoleSchema) {}
/** Bare-array list response. */
export class RoleListDto extends createZodDto(z.array(RoleSchema)) {}

/** `PUT /roles/:id/permissions` body: the full desired grant set (replaces, not merges). */
export class ReplaceRolePermissionsDto extends createZodDto(
  z.object({ permissionIds: z.array(z.uuid()) }),
) {}

/** Response for the role's granted permissions: bare array of the full permission rows. */
export class RolePermissionsDto extends createZodDto(z.array(PermissionSchema)) {}
