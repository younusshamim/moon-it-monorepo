// Branches API module — the reference for the resource-per-file convention
// (docs/architecture-review/12-frontend-api-handling.md). One `createResourceApi` call gives the whole
// client data layer: typed keys, isomorphic list/detail `queryOptions`, and create/update/delete hooks,
// all validated against the shared `@moonit/schema` contract. Reads/writes hit `/v1/branches`
// same-origin (Next rewrite → API), so the session cookie flows automatically.
import { type Branch, BranchSchema, type NewBranch, type UpdateBranch } from "@moonit/schema";
import { createResourceApi } from "@/lib/api/create-resource-api";

/** List filters accepted by `GET /v1/branches` (all optional; omitted keys fall back to API defaults). */
export type BranchListParams = { page?: number; pageSize?: number; search?: string };

export const branchesApi = createResourceApi<Branch, NewBranch, UpdateBranch, BranchListParams>({
  resource: "branches",
  entitySchema: BranchSchema,
});
