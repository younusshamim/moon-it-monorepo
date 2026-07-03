// nestjs-zod DTOs for branch-scoped role assignment. The create body is a request-only shape (roleId +
// optional branchId; null/absent = all branches). Responses use the UserRole entity schema.
import { NewUserRoleSchema, UserRoleSchema } from "@moonit/schema";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

/** `POST /users/:id/roles` body — `userId` comes from the path, so only roleId + branchId here. */
export class AssignRoleDto extends createZodDto(
  z.object({ roleId: z.uuid(), branchId: z.uuid().nullish() }),
) {}

/** Single assignment response. */
export class UserRoleDto extends createZodDto(UserRoleSchema) {}
/** Bare-array response for a user's assignments. */
export class UserRoleListDto extends createZodDto(z.array(UserRoleSchema)) {}

// Re-exported for the repository create signature.
export type NewUserRoleInput = z.infer<typeof NewUserRoleSchema>;
