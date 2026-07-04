// Role write mutations: CRUD (system roles are read-only server-side → 403 on update/delete) plus
// replacing a role's permission grant set via `PUT /roles/:id/permissions`.
import {
  type NewRole,
  type Permission,
  PermissionSchema,
  type Role,
  RoleSchema,
  type UpdateRole,
} from "@moonit/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";

const PermissionListSchema = z.array(PermissionSchema);

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewRole): Promise<Role> =>
      apiFetch("/v1/roles", { method: "POST", body: input, schema: RoleSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRole }): Promise<Role> =>
      apiFetch(`/v1/roles/${id}`, { method: "PATCH", body: input, schema: RoleSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<void> => apiFetch(`/v1/roles/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
  });
}

export interface ReplaceRolePermissionsInput {
  roleId: string;
  permissionIds: string[];
}

export function useReplaceRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: ReplaceRolePermissionsInput): Promise<Permission[]> =>
      apiFetch(`/v1/roles/${roleId}/permissions`, {
        method: "PUT",
        body: { permissionIds },
        schema: PermissionListSchema,
      }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.permissions(variables.roleId) }),
  });
}
