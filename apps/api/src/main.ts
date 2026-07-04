// Fastify bootstrap with Pino logging, Sentry, an OpenTelemetry tracer stub, contract-first OpenAPI,
// and a request-scoped correlation id from @moonit/core (INFRASTRUCTURE.md §1, §11).
import "reflect-metadata";
// Side-effect import: Sentry must initialise before anything else loads.
import "./instrument.js";

import type { IncomingMessage } from "node:http";
import { generateCorrelationId } from "@moonit/core";
import { RequestMethod } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { AppModule } from "./app.module.js";
import { env } from "./config/env.js";
import { startTracing } from "./tracing.js";

async function bootstrap(): Promise<void> {
  await startTracing();

  const adapter = new FastifyAdapter({
    // The correlation id: reuse an inbound x-correlation-id, otherwise generate one.
    // It becomes `req.id`, which nestjs-pino logs and the interceptor/filter surface.
    genReqId: (req: IncomingMessage) =>
      (req.headers["x-correlation-id"] as string | undefined) ?? generateCorrelationId(),
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  // Version every feature route under `/v1`; `/health` stays unprefixed for orchestrator/web probes
  // (docs/API_AND_AUTH_PLAN.md, Phase 0). Set before the OpenAPI doc so Swagger reflects the prefix.
  app.setGlobalPrefix("v1", {
    exclude: [{ path: "health", method: RequestMethod.ALL }],
  });

  // Echo the correlation id back so clients can trace their request.
  adapter.getInstance().addHook("onRequest", (request, reply, done) => {
    void reply.header("x-correlation-id", request.id);
    done();
  });

  // Contract-first OpenAPI generated from the registered zod-to-openapi schemas.
  const openApiConfig = new DocumentBuilder()
    .setTitle("Moon IT API")
    .setDescription("Moon IT admin platform API")
    .setVersion("0.0.0")
    // The API authenticates via the Better Auth session cookie (issued by `/api/auth/sign-in/email`).
    // Declaring it here surfaces the scheme in Swagger; `@ApiCookieAuth()` marks protected routes.
    .addCookieAuth("better-auth.session_token", {
      type: "apiKey",
      in: "cookie",
      name: "better-auth.session_token",
    })
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup("docs", app, cleanupOpenApiDoc(document));

  app.enableShutdownHooks();
  await app.listen({ port: env.PORT, host: env.HOST });
}

void bootstrap();
