// Structured Pino logging with a request-scoped correlation id (INFRASTRUCTURE.md §11).
// The correlation id is established by the Fastify adapter's `genReqId` (see main.ts) and surfaces
// on `req.id`; nestjs-pino attaches it to every log line via `customProps`.
import { LoggerModule } from "nestjs-pino";
import { env } from "../../config/env.js";

const isDev = env.NODE_ENV !== "production";

export const PinoLoggerModule = LoggerModule.forRoot({
  pinoHttp: {
    level: env.LOG_LEVEL,
    customProps: (req) => ({ correlationId: req.id }),
    redact: ["req.headers.authorization", "req.headers.cookie"],
    // Pretty, human-readable logs in dev; raw JSON in prod for log shippers.
    // Spread (not `transport: undefined`) to satisfy exactOptionalPropertyTypes.
    ...(isDev ? { transport: { target: "pino-pretty" } } : {}),
  },
});
