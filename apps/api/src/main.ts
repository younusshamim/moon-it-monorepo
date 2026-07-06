// Fastify bootstrap with Pino logging, Sentry, an OpenTelemetry tracer stub, contract-first OpenAPI,
// and a request-scoped correlation id from @moonit/core (INFRASTRUCTURE.md §1, §11).
import "reflect-metadata";
// Side-effect import: Sentry must initialise before anything else loads.
import "./instrument.js";

import type { IncomingMessage } from "node:http";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { generateCorrelationId } from "@moonit/core";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { SwaggerModule } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { AppModule } from "./app.module.js";
import { env } from "./config/env.js";
import { applyGlobalPrefix } from "./global-prefix.js";
import { createOpenApiDocument } from "./openapi.js";
import { startTracing } from "./tracing.js";

async function bootstrap(): Promise<void> {
  await startTracing();

  const adapter = new FastifyAdapter({
    // The correlation id: reuse an inbound x-correlation-id, otherwise generate one.
    // It becomes `req.id`, which nestjs-pino logs and the interceptor/filter surface.
    genReqId: (req: IncomingMessage) =>
      (req.headers["x-correlation-id"] as string | undefined) ?? generateCorrelationId(),
  });

  // Security headers and the app-wide rate limit must be registered on the raw Fastify instance
  // *before* `NestFactory.create()`: `AuthModule.onModuleInit()` mounts `/api/auth/*` during that
  // call (see `auth.module.ts`), and `@fastify/rate-limit`'s per-route `config.rateLimit` override
  // only takes effect on routes added after its `onRoute` hook is registered.
  const fastify = adapter.getInstance();
  // CSP is disabled globally because Swagger UI at `/docs` needs inline scripts; every other
  // helmet header (x-frame-options, x-content-type-options, etc.) still applies everywhere.
  await fastify.register(helmet, { contentSecurityPolicy: false });
  // App-wide budget for `/v1/*` (and everything else); the Better Auth mount in
  // `better-auth.handler.ts` layers its own stricter per-route override on top of this instance.
  await fastify.register(rateLimit, { global: true, max: 300, timeWindow: "1 minute" });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  // Set before the OpenAPI doc so Swagger reflects the prefix.
  applyGlobalPrefix(app);

  // No enableCors(): browser traffic reaches this API same-origin via the Next.js rewrite in
  // apps/admin/next.config.ts, and Better Auth's `trustedOrigins` (env `WEB_ORIGIN`) covers the
  // `/api/auth/*` surface. If a non-proxied consumer (mobile app, third party) is ever added, add
  // `app.enableCors({ origin: [...], credentials: true })` here.

  // Echo the correlation id back so clients can trace their request.
  adapter.getInstance().addHook("onRequest", (request, reply, done) => {
    void reply.header("x-correlation-id", request.id);
    done();
  });

  // Contract-first OpenAPI generated from the registered zod-to-openapi schemas. Shared with
  // `openapi-export.ts` via `createOpenApiDocument` so the served spec and the exported artifact
  // can't drift.
  const document = createOpenApiDocument(app);
  SwaggerModule.setup("docs", app, cleanupOpenApiDoc(document));

  app.enableShutdownHooks();
  await app.listen({ port: env.PORT, host: env.HOST });
}

void bootstrap();
