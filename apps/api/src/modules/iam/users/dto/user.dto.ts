// nestjs-zod DTOs for the users endpoints. Bodies wrap @moonit/schema; there is no password field —
// credentials live in Better Auth's `accounts` table (Phase 4). The list query adds an optional
// `status` filter on top of the shared pagination contract. See docs/API_AND_AUTH_PLAN.md, Phase 2.
import {
  NewUserSchema,
  PaginationQuerySchema,
  paginated,
  UpdateUserSchema,
  UserSchema,
  UserStatusSchema,
} from "@moonit/schema";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class CreateUserDto extends createZodDto(NewUserSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

/** Single-user response. */
export class UserDto extends createZodDto(UserSchema) {}
/** Paginated list response. */
export class UserPageDto extends createZodDto(paginated(UserSchema)) {}

/** List query: pagination plus an optional `status` filter. */
const UserListQuerySchema = PaginationQuerySchema.extend({ status: UserStatusSchema.optional() });
export class UserListQueryDto extends createZodDto(UserListQuerySchema) {}
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
