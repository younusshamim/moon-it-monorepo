// A typed error for non-2xx API responses, so callers can branch on status (and TanStack Query can
// surface a real message) instead of string-matching `throw new Error(...)` (INFRASTRUCTURE.md §6).

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : `API request failed with ${status} ${statusText}`,
    );
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // Non-JSON error body — fall back to the status line.
    }
    return new ApiError(response.status, response.statusText, body);
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}
