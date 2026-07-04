// Global authorization guard: enforces the permission keys declared by `@RequirePermissions` on a
// route. Runs after AuthGuard (registered second in AuthModule), so `request.user` is already set.
// `super_admin` short-circuits to allow-all. Otherwise it loads the caller's effective grants, checks
// every required key, and attaches an AuthzContext to the request for the fine-grained branch-scope
// checks that services perform via `@Authz()`. Missing key → ForbiddenError (403).
//
// Branch scoping is *not* done here: the guard is domain-agnostic and can't know a resource's branch
// for `:id` routes without a redundant DB read, so services enforce it where the row is already known.
// See docs/API_AND_AUTH_PLAN.md Phase 6.
import { ROLES } from "@moonit/auth";
import { ForbiddenError } from "@moonit/core";
import type { PermissionKey } from "@moonit/schema";
import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthzContext, superAdminContext } from "./authz-context.js";
import { PermissionsService } from "./permissions.service.js";
import { PERMISSIONS_KEY } from "./require-permissions.decorator.js";
import type { AuthenticatedRequest } from "./session-user.js";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    // Defensive: PermissionsGuard runs after AuthGuard, which sets `user` or throws 401 first.
    if (!user) throw new ForbiddenError("Authentication required");

    if (user.roles.some((r) => r.role === ROLES.SUPER_ADMIN)) {
      request.authz = superAdminContext();
      return true;
    }

    const grants = await this.permissions.loadGrants(user.id);
    const authz = new AuthzContext(false, grants);
    for (const permission of required) {
      if (!authz.has(permission)) {
        throw new ForbiddenError(`Missing required permission: ${permission}`);
      }
    }

    request.authz = authz;
    return true;
  }
}
