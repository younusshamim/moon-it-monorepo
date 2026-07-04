// Serialize a flat params object into a query string (`?a=1&b=x`), dropping empty/undefined values so
// keys fall back to the API's documented defaults. Shared by every list query module.
export type ListParamValue = string | number | boolean | undefined | null;

export function toSearchParams(params: Record<string, ListParamValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
