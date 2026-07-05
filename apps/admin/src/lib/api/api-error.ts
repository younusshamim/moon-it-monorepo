// A typed error for non-2xx API responses, so callers can branch on status (and TanStack Query can
// surface a real message) instead of string-matching `throw new Error(...)` (INFRASTRUCTURE.md §6).
//
// The API's error envelope (see apps/api `DomainExceptionFilter`) is:
//   { code?, message, issues?, statusCode, correlationId, path, timestamp }
// This class parses those fields off the response body so the app can act on them structurally:
//   - `code`          — the domain error code ("CONFLICT", "VALIDATION_ERROR", …) for branching
//   - `issues`        — field-level validation issues (422), mappable onto a form via `form-errors.ts`
//   - `correlationId` — echo it in logs / support UI so a failure can be traced to the server log line

/** One field-level validation issue, matching @moonit/core `ValidationError.issues`. */
export interface ApiValidationIssue {
  path: (string | number)[];
  message: string;
}

interface ApiErrorEnvelope {
  code: string | undefined;
  message: string | undefined;
  issues: ApiValidationIssue[] | undefined;
  correlationId: string | undefined;
}

function readEnvelope(body: unknown): ApiErrorEnvelope {
  const empty: ApiErrorEnvelope = {
    code: undefined,
    message: undefined,
    issues: undefined,
    correlationId: undefined,
  };
  if (typeof body !== "object" || body === null) return empty;
  const record = body as Record<string, unknown>;
  return {
    code: typeof record.code === "string" ? record.code : undefined,
    message: typeof record.message === "string" ? record.message : undefined,
    issues: Array.isArray(record.issues) ? (record.issues as ApiValidationIssue[]) : undefined,
    correlationId: typeof record.correlationId === "string" ? record.correlationId : undefined,
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;
  readonly code: string | undefined;
  readonly issues: ApiValidationIssue[] | undefined;
  readonly correlationId: string | undefined;

  constructor(status: number, statusText: string, body: unknown) {
    const envelope = readEnvelope(body);
    super(envelope.message ?? `API request failed with ${status} ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.code = envelope.code;
    this.issues = envelope.issues;
    this.correlationId = envelope.correlationId;
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

  /** True when the server rejected the payload with field-level issues we can map onto a form. */
  get hasFieldIssues(): boolean {
    return Array.isArray(this.issues) && this.issues.length > 0;
  }
}
