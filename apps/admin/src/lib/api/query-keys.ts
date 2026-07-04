// Centralized query-key factory. Keeping keys in one typed place keeps invalidation honest and
// prevents the stringly-typed key sprawl that breaks `invalidateQueries` across a large dashboard.
// Each domain owns a namespace: `all()` is the invalidation root, `list(params)` a filtered
// collection, `detail(id)` a single row.
import type { ListParamValue } from "@/lib/api/list-params";

type ListParams = Record<string, ListParamValue>;

export const queryKeys = {
  health: () => ["health"] as const,
  session: () => ["session", "me"] as const,

  branches: {
    all: () => ["branches"] as const,
    list: (params: ListParams = {}) => ["branches", "list", params] as const,
    detail: (id: string) => ["branches", "detail", id] as const,
  },
  rooms: {
    all: () => ["rooms"] as const,
    list: (params: ListParams = {}) => ["rooms", "list", params] as const,
    detail: (id: string) => ["rooms", "detail", id] as const,
  },
  departments: {
    all: () => ["departments"] as const,
    list: (params: ListParams = {}) => ["departments", "list", params] as const,
    detail: (id: string) => ["departments", "detail", id] as const,
  },
  users: {
    all: () => ["users"] as const,
    list: (params: ListParams = {}) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    roles: (id: string) => ["users", "detail", id, "roles"] as const,
  },
  roles: {
    all: () => ["roles"] as const,
    list: () => ["roles", "list"] as const,
    permissions: (id: string) => ["roles", "detail", id, "permissions"] as const,
  },
  permissions: {
    all: () => ["permissions"] as const,
    list: () => ["permissions", "list"] as const,
  },
} as const;
