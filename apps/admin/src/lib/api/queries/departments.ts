// Department read queries. `/v1/departments` is paginated and filterable by `branchId` (`null` =
// institute-wide).
import { type Department, DepartmentSchema, type Paginated, paginated } from "@moonit/schema";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { type ListParamValue, toSearchParams } from "@/lib/api/list-params";
import { queryKeys } from "@/lib/api/query-keys";

const DepartmentPageSchema = paginated(DepartmentSchema);

export interface DepartmentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  branchId?: string;
}

export function departmentsQueryOptions(params: DepartmentListParams = {}) {
  const query: Record<string, ListParamValue> = {
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    branchId: params.branchId,
  };
  return queryOptions({
    queryKey: queryKeys.departments.list(query),
    queryFn: (): Promise<Paginated<Department>> =>
      apiFetch(`/v1/departments${toSearchParams(query)}`, { schema: DepartmentPageSchema }),
  });
}
