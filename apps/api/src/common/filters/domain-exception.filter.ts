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
