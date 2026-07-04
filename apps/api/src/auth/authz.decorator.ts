// `@Authz()` — the request's AuthzContext, attached by PermissionsGuard. Controllers pass it into
// branch-scoped write services so they can call `assertBranch(...)` with the resource's branch. Only
// present on routes carrying `@RequirePermissions` (the guard sets it there); using it elsewhere is a
// wiring bug, mirroring `@CurrentUser()`. See docs/API_AND_AUTH_PLAN.md Phase 6.
import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthzContext } from "./authz-context.js";
import type { AuthenticatedRequest } from "./session-user.js";

export const Authz = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthzContext => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.authz) {
      throw new Error(
        "No AuthzContext on request — @Authz() requires @RequirePermissions + PermissionsGuard",
      );
    }
    return request.authz;
  },
);
