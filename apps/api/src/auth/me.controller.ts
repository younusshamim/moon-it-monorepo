// `GET /v1/me` — the authenticated principal the web dashboard shell reads to render the current user,
// gate UI affordances by permission, and populate the branch switcher. Requires only authentication
// (no `@RequirePermissions`): the global AuthGuard attaches `@CurrentUser()`, and this endpoint enriches
// it with the effective permission keys and branch scope from `user_roles → role_permissions`.
//
// UI gating only — the returned permissions/scope mirror the server checks but are never the boundary;
// every mutation is still authorized by the guards + service `assertBranch` on its own.
import {
  type PermissionKey,
  type SessionUser as SessionUserResponse,
  SessionUserSchema,
} from "@moonit/schema";
import { Controller, Get } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { createZodDto, ZodSerializerDto } from "nestjs-zod";
import { CurrentUser } from "./current-user.decorator.js";
import { PermissionsService } from "./permissions.service.js";
import type { SessionUser } from "./session-user.js";

/** Response DTO for the session principal (validated by the global ZodSerializerInterceptor). */
class SessionUserDto extends createZodDto(SessionUserSchema) {}

@ApiTags("Auth")
@ApiCookieAuth()
@Controller("me")
export class MeController {
  constructor(private readonly permissions: PermissionsService) {}

  @Get()
  @ZodSerializerDto(SessionUserDto)
  async me(@CurrentUser() user: SessionUser): Promise<SessionUserResponse> {
    const grants = await this.permissions.loadGrants(user.id);
    const permissions = [...new Set(grants.map((g) => g.permission))] as PermissionKey[];

    // Branch scope is derived from the role assignments: a null-scoped assignment (super_admin, or an
    // institute-wide grant) means "all branches" → null; otherwise the distinct set of branch ids.
    const branchIds = user.roles.map((r) => r.branchId);
    const branchScope = branchIds.includes(null) ? null : [...new Set(branchIds as string[])];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions,
      branchScope,
    };
  }
}
