// Pagination helpers bridging the shared PaginationQuery contract to Drizzle `limit`/`offset` and back
// into the `{ data, page, pageSize, total }` envelope, so every list repository/service stays
// consistent (docs/API_AND_AUTH_PLAN.md, Phase 0).
import type { Paginated, PaginationQuery } from "@moonit/schema";

/** Convert a validated PaginationQuery into Drizzle `limit`/`offset`. */
export function toLimitOffset(query: Pick<PaginationQuery, "page" | "pageSize">): {
  limit: number;
  offset: number;
} {
  return { limit: query.pageSize, offset: (query.page - 1) * query.pageSize };
}

/** Assemble a page of rows + total count into the standard response envelope. */
export function buildPage<T>(
  data: T[],
  total: number,
  query: Pick<PaginationQuery, "page" | "pageSize">,
): Paginated<T> {
  return { data, page: query.page, pageSize: query.pageSize, total };
}
