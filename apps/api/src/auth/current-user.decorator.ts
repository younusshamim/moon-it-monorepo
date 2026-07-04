// `@CurrentUser()` — the request principal attached by AuthGuard. On guarded routes it is always
// present; the type reflects that (the guard throws 401 before the handler runs otherwise).
import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthenticatedRequest, SessionUser } from "./session-user.js";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      // Reached only if @CurrentUser() is used on a @Public() route — a wiring bug, not a runtime path.
      throw new Error("No authenticated user on request — @CurrentUser() requires the AuthGuard");
    }
    return request.user;
  },
);
