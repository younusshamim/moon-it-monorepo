// User write mutations: invite (create — provisions an `invited` domain row, no password), update,
// deactivate (status → suspended), and branch-scoped role assignment.
import {
  type NewUser,
  type UpdateUser,
  type User,
  UserRoleSchema,
  UserSchema,
} from "@moonit/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewUser): Promise<User> =>
      apiFetch("/v1/users", { method: "POST", body: input, schema: UserSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUser }): Promise<User> =>
      apiFetch(`/v1/users/${id}`, { method: "PATCH", body: input, schema: UserSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<User> =>
      apiFetch(`/v1/users/${id}/deactivate`, { method: "POST", schema: UserSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
  });
}

export interface AssignRoleInput {
  userId: string;
  roleId: string;
  branchId?: string | null;
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId, branchId }: AssignRoleInput) =>
      apiFetch(`/v1/users/${userId}/roles`, {
        method: "POST",
        body: { roleId, branchId },
        schema: UserRoleSchema,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.roles(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}

// A user's role assignment is deleted by its join-row id via `/v1/user-roles/:id`.
export function useRemoveUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userRoleId: string): Promise<void> =>
      apiFetch(`/v1/user-roles/${userRoleId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
  });
}
