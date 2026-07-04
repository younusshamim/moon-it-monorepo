// One global filter mapping @moonit/core domain errors → HTTP status, passing HttpExceptions
// through, and reporting everything unexpected to Sentry (INFRASTRUCTURE.md §6, §11). The
// transport edge owns status codes; domain logic only returns tagged failures.

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
import type { FastifyRequest } from "fastify";
import { PinoLogger } from "nestjs-pino";

const STATUS_BY_CODE: Record<DomainErrorCode, HttpStatus> = {
  NOT_FOUND: HttpStatus.NOT_FOUND,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  CONFLICT: HttpStatus.CONFLICT,
  VALIDATION_ERROR: HttpStatus.UNPROCESSABLE_ENTITY,
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
    const body: Record<string, unknown> = {};

    if (exception instanceof DomainError) {
      status = STATUS_BY_CODE[exception.code];
      body.code = exception.code;
      body.message = exception.message;
      if (exception instanceof ValidationError) {
        body.issues = exception.issues;
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === "string") {
        body.message = response;
      } else {
        Object.assign(body, response);
      }
    } else if (isHttpError(exception)) {
      // Errors raised by Fastify plugins on the raw routes (e.g. @fastify/rate-limit's 429 on
      // `/api/auth/*`) carry their own HTTP status — honor it instead of masking it as a 500.
      status = exception.statusCode;
      body.message = exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      body.message = "Internal server error";
      this.logger.error({ err: exception }, "unhandled exception");
      Sentry.captureException(exception);
    }

    body.statusCode = status;
    body.correlationId = request.id;
    body.path = httpAdapter.getRequestUrl(request);
    body.timestamp = new Date().toISOString();

    httpAdapter.reply(ctx.getResponse(), body, status);
  }
}
