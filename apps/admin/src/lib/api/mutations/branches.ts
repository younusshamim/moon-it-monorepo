// Branch write mutations. Each calls `apiFetch` against `/v1/branches` (same-origin → API) and, on
// success, invalidates the branches namespace so lists refetch. DELETE is a soft delete server-side.
import { type Branch, BranchSchema, type NewBranch, type UpdateBranch } from "@moonit/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewBranch): Promise<Branch> =>
      apiFetch("/v1/branches", { method: "POST", body: input, schema: BranchSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.branches.all() }),
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBranch }): Promise<Branch> =>
      apiFetch(`/v1/branches/${id}`, { method: "PATCH", body: input, schema: BranchSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.branches.all() }),
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<void> => apiFetch(`/v1/branches/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.branches.all() }),
  });
}
