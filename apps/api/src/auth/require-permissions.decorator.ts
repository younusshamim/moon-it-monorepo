// `@RequirePermissions(...keys)` declares the permission keys a route needs. The global
// PermissionsGuard reads this metadata and enforces the keys (with a `super_admin` short-circuit).
// Keys are typed as `PermissionKey` from the shared RBAC catalog (@moonit/schema), so only catalog
// keys compile — the guard and the seed can never drift. See docs/API_AND_AUTH_PLAN.md Phase 6.
import type { PermissionKey } from "@moonit/schema";
import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "requiredPermissions";

/** Require every listed permission key to reach the handler (or the whole controller). */
export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
