// Wires the request-scoped Pino context and emits a structured completion log with duration.
// Registered globally as an APP_INTERCEPTOR (INFRASTRUCTURE.md §6, §11).
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { PinoLogger } from "nestjs-pino";
import type { Observable } from "rxjs";
import { tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext("HTTP");
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    // Bind the correlation id so every log within this request carries it.
    this.logger.assign({ correlationId: request.id });
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() =>
        this.logger.info(
          {
            method: request.method,
            url: request.url,
            durationMs: Date.now() - startedAt,
          },
          "request completed",
        ),
      ),
    );
  }
}
