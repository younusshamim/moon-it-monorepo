// Role read queries. Roles and a role's granted permissions are small fixed sets, so both are bare
// arrays (not paginated).
import { type Permission, PermissionSchema, type Role, RoleSchema } from "@moonit/schema";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";

const RoleListSchema = z.array(RoleSchema);
const PermissionListSchema = z.array(PermissionSchema);

export function rolesQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.roles.list(),
    queryFn: (): Promise<Role[]> => apiFetch("/v1/roles", { schema: RoleListSchema }),
  });
}

export function rolePermissionsQueryOptions(roleId: string) {
  return queryOptions({
    queryKey: queryKeys.roles.permissions(roleId),
    queryFn: (): Promise<Permission[]> =>
      apiFetch(`/v1/roles/${roleId}/permissions`, { schema: PermissionListSchema }),
  });
}
