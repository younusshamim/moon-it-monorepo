// Reference query module — the template every feature read follows (INFRASTRUCTURE.md §6):
//   1. a Zod schema for the response (here defined inline; domain reads parse `@moonit/schema`),
//   2. `queryOptions(...)` pairing a typed key with the isomorphic fetcher,
//   3. consumed by RSC `prefetchQuery` (server) and `useQuery` (client) off the *same* object.
// It targets the NestJS API's real `/health` endpoint (Terminus), so the pattern is demonstrably live.
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";

export const HealthStatusSchema = z.enum(["ok", "error", "shutting_down"]);

const HealthIndicatorSchema = z.object({ status: z.string() });

export const HealthSchema = z.object({
  status: HealthStatusSchema,
  info: z.record(z.string(), HealthIndicatorSchema).optional(),
  error: z.record(z.string(), HealthIndicatorSchema).optional(),
  details: z.record(z.string(), HealthIndicatorSchema).optional(),
});

export type Health = z.infer<typeof HealthSchema>;

export function healthQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.health(),
    queryFn: () => apiFetch("/health", { schema: HealthSchema }),
    staleTime: 30 * 1000,
  });
}
