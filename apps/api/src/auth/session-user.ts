// The authenticated principal attached to each request by AuthGuard and read via `@CurrentUser()`.
// Carries identity (from the Better Auth session) plus the user's role assignments and their branch
// scope (from `user_roles`). Effective *permissions* (the role→permission catalog) are resolved by the
// Phase 6 PermissionsGuard; this is the identity + scope those checks build on.
import type { FastifyRequest } from "fastify";

/** One role assignment: the role key and the branch it applies to (`null` = all branches). */
export interface SessionRole {
  role: string;
  branchId: string | null;
}

/** The request principal. `id` stamps audit columns; `roles` feeds the Phase 6 authorization checks. */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  roles: SessionRole[];
}

/** A Fastify request after AuthGuard has attached the principal (absent on `@Public()` routes). */
export type AuthenticatedRequest = FastifyRequest & { user?: SessionUser };
