// Department write mutations. `branchId` may be null (institute-wide), which requires a null-scope
// grant server-side.
import {
  type Department,
  DepartmentSchema,
  type NewDepartment,
  type UpdateDepartment,
} from "@moonit/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewDepartment): Promise<Department> =>
      apiFetch("/v1/departments", { method: "POST", body: input, schema: DepartmentSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() }),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDepartment }): Promise<Department> =>
      apiFetch(`/v1/departments/${id}`, { method: "PATCH", body: input, schema: DepartmentSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() }),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<void> =>
      apiFetch(`/v1/departments/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() }),
  });
}
