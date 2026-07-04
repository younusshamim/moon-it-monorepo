// The core, client-safe API fetcher. Used by the shared `queryOptions` so a query's `queryFn` is
// written once and runs in both the browser (TanStack Query refetch) and on the server (RSC prefetch)
// without ever pulling server-only modules into the client bundle (INFRASTRUCTURE.md §4, §6):
//
//   - The response is validated by parsing with the shared `@moonit/schema` Zod schema — runtime-safe
//     and fully typed, no generated client.
//   - In the browser, `credentials: "include"` sends the session cookie automatically.
//   - For *server-side* reads that must forward the caller's session cookie, use `serverApiFetch`
//     from `./server-fetch` (server-only) — it delegates here with the cookie header + internal URL.
import type { ZodType } from "zod";
import { ApiError } from "@/lib/api/api-error";
import { clientEnv } from "@/lib/env.client";

export interface ApiFetchOptions<TOutput> extends Omit<RequestInit, "body"> {
  /** Zod schema the JSON response is parsed with. Omit for endpoints with no response body. */
  schema?: ZodType<TOutput>;
  /** Request body — plain objects are JSON-serialized automatically. */
  body?: unknown;
  /** Override the API base URL (server reads target the internal `API_URL`). Defaults to the public URL. */
  baseUrl?: string;
  /** Next.js fetch cache/revalidation options. */
  next?: { revalidate?: number | false; tags?: string[] };
}

export async function apiFetch<TOutput = unknown>(
  path: string,
  options: ApiFetchOptions<TOutput> = {},
): Promise<TOutput> {
  const { schema, body, baseUrl = clientEnv.NEXT_PUBLIC_API_URL, next, ...init } = options;

  const headers = new Headers(init.headers);
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }

  const requestBody: BodyInit | null =
    body === undefined ? null : body instanceof FormData ? body : JSON.stringify(body);

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
    body: requestBody,
    ...(next ? { next } : {}),
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  if (response.status === 204 || !schema) {
    return undefined as TOutput;
  }

  return schema.parse(await response.json());
}
