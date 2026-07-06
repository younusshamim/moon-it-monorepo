// One global filter mapping @moonit/core domain errors → an RFC 9457 (application/problem+json)
// response, passing HttpExceptions through, and reporting everything unexpected to Sentry
// (INFRASTRUCTURE.md §6, §11). The transport edge owns status codes; domain logic only returns
// tagged failures.
//
// apps/admin follow-up (not done here — API-only change): this filter used to emit
// `{ code, message, issues, statusCode, correlationId, path, timestamp }`. It now emits the RFC 9457
// shape `{ type, title, status, detail, instance, code?, issues?, correlationId, timestamp }` with
// `Content-Type: application/problem+json`. `apps/admin/src/lib/api/api-error.ts`'s `readEnvelope()`
// needs to read `detail` (not `message`) as the fallback message; `code`/`issues`/`correlationId` are
// unchanged extension members, so `hasFieldIssues`/`form-errors.ts` need no change. `error-message.ts`
// needs no change either (it just reads `Error.message`, derived from the envelope in the constructor).
import { DomainError, type DomainErrorCode, ValidationError } from "@moonit/core";
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import * as Sentry from "@sentry/node";
import type { FastifyReply, FastifyRequest } from "fastify";
import { PinoLogger } from "nestjs-pino";

const STATUS_BY_CODE: Record<DomainErrorCode, HttpStatus> = {
  NOT_FOUND: HttpStatus.NOT_FOUND,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  CONFLICT: HttpStatus.CONFLICT,
  VALIDATION_ERROR: HttpStatus.UNPROCESSABLE_ENTITY,
};

// Human-readable RFC 9457 `title` for statuses this API actually returns; anything else falls back
// to a generic "HTTP Error {status}" so an unanticipated status still produces a valid problem doc.
const TITLE_BY_STATUS: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: "Bad Request",
  [HttpStatus.UNAUTHORIZED]: "Unauthorized",
  [HttpStatus.FORBIDDEN]: "Forbidden",
  [HttpStatus.NOT_FOUND]: "Not Found",
  [HttpStatus.CONFLICT]: "Conflict",
  [HttpStatus.UNPROCESSABLE_ENTITY]: "Validation Error",
  [HttpStatus.TOO_MANY_REQUESTS]: "Too Many Requests",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "Internal Server Error",
};

/** A Fastify-style error carrying its own HTTP status (e.g. @fastify/rate-limit's 429). */
function isHttpError(error: unknown): error is Error & { statusCode: number } {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) return false;
  const status = (error as { statusCode: unknown }).statusCode;
  return typeof status === "number" && status >= 400 && status < 600;
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext("ExceptionFilter");
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();

    let status: number;
    let detail: string;
    const extensions: Record<string, unknown> = {};

    if (exception instanceof DomainError) {
      status = STATUS_BY_CODE[exception.code];
      detail = exception.message;
      extensions.code = exception.code;
      if (exception instanceof ValidationError) {
        extensions.issues = exception.issues;
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === "string") {
        detail = response;
      } else {
        const { message, statusCode: _statusCode, ...rest } = response as Record<string, unknown>;
        // Not every HttpException response carries a `message` (e.g. Terminus's health-check
        // payload is `{ status, info, error, details }`) — fall back to a generic detail rather
        // than silently dropping the RFC 9457 `detail` member.
        detail =
          typeof message === "string"
            ? message
            : (TITLE_BY_STATUS[status] ?? `HTTP Error ${status}`);
        Object.assign(extensions, rest);
      }
    } else if (isHttpError(exception)) {
      // Errors raised by Fastify plugins on the raw routes (e.g. @fastify/rate-limit's 429 on
      // `/api/auth/*`) carry their own HTTP status — honor it instead of masking it as a 500.
      status = exception.statusCode;
      detail = exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      detail = "Internal server error";
      this.logger.error({ err: exception }, "unhandled exception");
      Sentry.captureException(exception);
    }

    const code = typeof extensions.code === "string" ? extensions.code : undefined;
    // Extensions first: some sources (e.g. Terminus's health payload) carry their own `status` field
    // with an unrelated meaning ("error"/"ok") — the RFC 9457 members below must win over those.
    const body = {
      ...extensions,
      type: `urn:moonit:error:${code ?? `HTTP_${status}`}`,
      title: TITLE_BY_STATUS[status] ?? `HTTP Error ${status}`,
      status,
      detail,
      instance: httpAdapter.getRequestUrl(request),
      correlationId: request.id,
      timestamp: new Date().toISOString(),
    };

    const reply = ctx.getResponse<FastifyReply>();
    reply.type("application/problem+json");
    httpAdapter.reply(reply, body, status);
  }
}
