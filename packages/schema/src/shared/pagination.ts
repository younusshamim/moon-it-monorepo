// Shared pagination contract: the list-query input and the `{ data, page, pageSize, total }` response
// envelope. Authored once here so both the API (outbound response validation via ZodSerializer) and
// the web fetcher (response parsing) derive the wire shape from a single source (INFRASTRUCTURE.md §4).
import { z } from "zod";

/** Sort direction for list endpoints. */
export const SortOrderSchema = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof SortOrderSchema>;

/**
 * Query params shared by every list endpoint. Values arrive as strings on the wire, so the numeric
 * fields coerce; absent fields fall back to the documented defaults (`page` 1, `pageSize` 20).
 * `pageSize` is capped at 100 to bound the worst-case query.
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  sort: z.string().min(1).optional(),
  order: SortOrderSchema.default("desc"),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

/** Wraps an item schema in the standard list envelope: `{ data, page, pageSize, total }`. */
export function paginated<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  });
}

/** The inferred shape of `paginated(schema)`, for hand-typing API returns without a schema instance. */
export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
