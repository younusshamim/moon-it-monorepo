// Factory for a standard REST resource's client data layer. A single call produces the whole "API
// module" for a CRUD entity — typed query-key namespace, isomorphic `queryOptions` for list + detail,
// and the create/update/delete mutation hooks — from one descriptor, so a new entity is ~10 lines
// instead of two hand-written files (a `queries/*.ts` + a `mutations/*.ts`) that drift.
//
// It is deliberately thin and escapable: it covers the conventional `GET /list`, `GET /:id`,
// `POST /`, `PATCH /:id`, `DELETE /:id` shape only. Anything non-standard (nested routes, custom
// actions, bespoke invalidation) stays hand-written next to the resource — don't grow this into an ORM.
//
// Fetching stays client-first (see docs/architecture-review/12-frontend-api-handling.md): the returned
// `queryOptions` run in the browser via `useQuery`, and remain isomorphic, so a page that genuinely
// benefits from server prefetch can still pass them to `prefetchQuery` with a `serverApiFetch` queryFn.
import { type Paginated, paginated } from "@moonit/schema";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ZodType } from "zod";
import { apiFetch } from "@/lib/api/fetcher";
import { type ListParamValue, toSearchParams } from "@/lib/api/list-params";

export interface ResourceApiConfig<TEntity> {
  /** Namespace for query keys and, by default, the URL segment: `branches` → `/v1/branches`. */
  resource: string;
  /** Zod schema for one entity row; the list schema is derived as `paginated(entitySchema)`. */
  entitySchema: ZodType<TEntity>;
  /** Override the base path when it isn't `/v1/${resource}` (e.g. a nested collection). */
  basePath?: string;
}

/** The stable typed key namespace for a resource: `all` (invalidation root), `list`, `detail`. */
export interface ResourceKeys<TListParams> {
  all: () => readonly [string];
  list: (params?: TListParams) => readonly [string, "list", TListParams];
  detail: (id: string) => readonly [string, "detail", string];
}

export function createResourceApi<
  TEntity,
  TNew,
  TUpdate,
  TListParams extends Record<string, ListParamValue> = Record<string, ListParamValue>,
>(config: ResourceApiConfig<TEntity>) {
  const base = config.basePath ?? `/v1/${config.resource}`;
  const pageSchema = paginated(config.entitySchema) as unknown as ZodType<Paginated<TEntity>>;

  const keys: ResourceKeys<TListParams> = {
    all: () => [config.resource] as const,
    list: (params = {} as TListParams) => [config.resource, "list", params] as const,
    detail: (id: string) => [config.resource, "detail", id] as const,
  };

  /** Isomorphic list query: `{ data, page, pageSize, total }`, keyed on the (serialized) params. */
  function listQuery(params: TListParams = {} as TListParams) {
    return queryOptions({
      queryKey: keys.list(params),
      queryFn: (): Promise<Paginated<TEntity>> =>
        apiFetch(`${base}${toSearchParams(params)}`, { schema: pageSchema }),
    });
  }

  /** Isomorphic single-row query. */
  function detailQuery(id: string) {
    return queryOptions({
      queryKey: keys.detail(id),
      queryFn: (): Promise<TEntity> => apiFetch(`${base}/${id}`, { schema: config.entitySchema }),
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (input: TNew): Promise<TEntity> =>
        apiFetch(base, { method: "POST", body: input, schema: config.entitySchema }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all() }),
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id: string; input: TUpdate }): Promise<TEntity> =>
        apiFetch(`${base}/${id}`, { method: "PATCH", body: input, schema: config.entitySchema }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all() }),
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string): Promise<void> => apiFetch(`${base}/${id}`, { method: "DELETE" }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all() }),
    });
  }

  return { keys, listQuery, detailQuery, useCreate, useUpdate, useDelete };
}
