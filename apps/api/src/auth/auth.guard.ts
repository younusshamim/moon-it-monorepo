// Global authentication guard: every Nest route requires a valid Better Auth session unless marked
// `@Public()`. Validates via SessionService, attaches the principal to the request (for `@CurrentUser()`
// and audit stamping), and throws 401 when the session is absent or invalid. Authorization (permission
// checks) is layered on top by the Phase 6 PermissionsGuard. See INFRASTRUCTURE.md §9.
//
// The Better Auth request handler (`/api/auth/*`) and Swagger (`/docs`) are raw Fastify routes, not Nest
// handlers, so this guard never sees them — only `@Public()` (e.g. `/health`) needs the opt-out.
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./public.decorator.js";
import { SessionService } from "./session.service.js";
import type { AuthenticatedRequest } from "./session-user.js";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.sessions.resolve(request.headers);
    if (!user) throw new UnauthorizedException("Authentication required");

    request.user = user;
    return true;
  }
}
