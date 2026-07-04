// Room read queries. `/v1/rooms` is paginated and filterable by `branchId` (rooms belong to a branch).
import { type Paginated, paginated, type Room, RoomSchema } from "@moonit/schema";
import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { type ListParamValue, toSearchParams } from "@/lib/api/list-params";
import { queryKeys } from "@/lib/api/query-keys";

const RoomPageSchema = paginated(RoomSchema);

export interface RoomListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  branchId?: string;
}

export function roomsQueryOptions(params: RoomListParams = {}) {
  const query: Record<string, ListParamValue> = {
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    branchId: params.branchId,
  };
  return queryOptions({
    queryKey: queryKeys.rooms.list(query),
    queryFn: (): Promise<Paginated<Room>> =>
      apiFetch(`/v1/rooms${toSearchParams(query)}`, { schema: RoomPageSchema }),
  });
}
