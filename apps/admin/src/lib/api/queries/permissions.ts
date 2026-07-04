// Permission read query. The catalog is a small seeded set, returned as a bare array.
import { type Permission, PermissionSchema } from "@moonit/schema";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";

const PermissionListSchema = z.array(PermissionSchema);

export function permissionsQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.permissions.list(),
    queryFn: (): Promise<Permission[]> =>
      apiFetch("/v1/permissions", { schema: PermissionListSchema }),
  });
}
