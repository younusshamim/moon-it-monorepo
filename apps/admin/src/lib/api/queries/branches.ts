// Branch read queries. Follows the health template: a `queryOptions(...)` object pairing a typed key
// with the isomorphic `apiFetch`, parsed against the shared `@moonit/schema` contract. Consumed by both
// RSC `prefetchQuery` (server) and `useQuery` (client) off the same object. Reads hit `/v1/branches`
// same-origin (Next rewrite → API), so the session cookie flows automatically.
import { type Branch, BranchSchema, type Paginated, paginated } from "@moonit/schema";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { type ListParamValue, toSearchParams } from "@/lib/api/list-params";
import { queryKeys } from "@/lib/api/query-keys";

const BranchPageSchema = paginated(BranchSchema);

export interface BranchListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function branchesQueryOptions(params: BranchListParams = {}) {
  const query: Record<string, ListParamValue> = {
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
  };
  return queryOptions({
    queryKey: queryKeys.branches.list(query),
    queryFn: (): Promise<Paginated<Branch>> =>
      apiFetch(`/v1/branches${toSearchParams(query)}`, { schema: BranchPageSchema }),
  });
}

export function branchQueryOptions(id: string) {
  return queryOptions({
    queryKey: queryKeys.branches.detail(id),
    queryFn: (): Promise<Branch> => apiFetch(`/v1/branches/${id}`, { schema: BranchSchema }),
  });
}
