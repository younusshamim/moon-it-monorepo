// Resolves the request principal: validates the session cookie/token via Better Auth, then loads the
// user's role assignments (+ branch scope) from `user_roles`. Isolated from the guard so the Better
// Auth call and the Drizzle read are unit-testable, and so Phase 6 can add per-request permission
// caching in one place. The role read is a single indexed lookup; Phase 6 may cache it (Redis).

import type { IncomingHttpHeaders } from "node:http";
import type { Auth } from "@moonit/auth";
import { type Database, roles, userRoles } from "@moonit/db";
import { Inject, Injectable } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import { eq } from "drizzle-orm";
import { DRIZZLE } from "../database/database.tokens.js";
import { AUTH } from "./auth.tokens.js";
import type { SessionRole, SessionUser } from "./session-user.js";

@Injectable()
export class SessionService {
  constructor(
    @Inject(AUTH) private readonly auth: Auth,
    @Inject(DRIZZLE) private readonly db: Database,
  ) {}

  /** Validate the request's session and build the principal, or `null` when absent/invalid. */
  async resolve(headers: IncomingHttpHeaders): Promise<SessionUser | null> {
    const session = await this.auth.api.getSession({ headers: fromNodeHeaders(headers) });
    if (!session) return null;

    const assignments = await this.loadRoles(session.user.id);
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      roles: assignments,
    };
  }

  private async loadRoles(userId: string): Promise<SessionRole[]> {
    return this.db
      .select({ role: roles.key, branchId: userRoles.branchId })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, userId));
  }
}
