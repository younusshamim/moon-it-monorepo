// Server-only API fetcher. Use this in Server Actions and RSC reads that must hit the API *as the
// signed-in user*: it forwards the incoming session cookie and targets the internal `API_URL`
// (INFRASTRUCTURE.md §6, §9). `import "server-only"` guarantees this never lands in a client bundle.
//
// For server prefetch of authenticated data, override the query's `queryFn` in the RSC:
//   queryClient.prefetchQuery({ ...thingQueryOptions(), queryFn: () => serverApiFetch("/things", ...) })
// Public reads (e.g. the health demo) can prefetch the plain options as-is.
import "server-only";
import { cookies } from "next/headers";
import { type ApiFetchOptions, apiFetch } from "@/lib/api/fetcher";
import { serverEnv } from "@/lib/env.server";

export async function serverApiFetch<TOutput = unknown>(
  path: string,
  options: ApiFetchOptions<TOutput> = {},
): Promise<TOutput> {
  const cookieHeader = (await cookies()).toString();
  const headers = new Headers(options.headers);
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  return apiFetch<TOutput>(path, {
    ...options,
    headers,
    baseUrl: options.baseUrl ?? serverEnv.API_URL,
  });
}
