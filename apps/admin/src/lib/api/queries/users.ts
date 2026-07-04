// User read queries. `/v1/users` is paginated; a user's role assignments are a bare array under
// `/v1/users/:id/roles`.
import { type Paginated, paginated, type User, UserRoleSchema, UserSchema } from "@moonit/schema";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/fetcher";
import { type ListParamValue, toSearchParams } from "@/lib/api/list-params";
import { queryKeys } from "@/lib/api/query-keys";

const UserPageSchema = paginated(UserSchema);
const UserRoleListSchema = z.array(UserRoleSchema);
export type UserRoleList = z.infer<typeof UserRoleListSchema>;

export interface UserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function usersQueryOptions(params: UserListParams = {}) {
  const query: Record<string, ListParamValue> = {
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
  };
  return queryOptions({
    queryKey: queryKeys.users.list(query),
    queryFn: (): Promise<Paginated<User>> =>
      apiFetch(`/v1/users${toSearchParams(query)}`, { schema: UserPageSchema }),
  });
}

export function userRolesQueryOptions(userId: string) {
  return queryOptions({
    queryKey: queryKeys.users.roles(userId),
    queryFn: (): Promise<UserRoleList> =>
      apiFetch(`/v1/users/${userId}/roles`, { schema: UserRoleListSchema }),
  });
}
