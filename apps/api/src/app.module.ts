// Root module: wires config, logging, infra clients, the health module, and the global
// cross-cutting providers (validation pipe, exception filter, logging interceptor).
// See INFRASTRUCTURE.md §6.
import { Module, type Provider } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { AuthModule } from "./auth/auth.module.js";
import { DomainExceptionFilter } from "./common/filters/domain-exception.filter.js";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor.js";
import { PinoLoggerModule } from "./common/logger/logger.module.js";
import { ConfigModule } from "./config/config.module.js";
import { env } from "./config/env.js";
import { DatabaseModule } from "./database/database.module.js";
import { HealthModule } from "./health/health.module.js";
import { IamModule } from "./modules/iam/iam.module.js";
import { OrganizationModule } from "./modules/organization/organization.module.js";
import { RedisModule } from "./redis/redis.module.js";

// Outbound response validation catches contract drift in dev/CI without paying per-response CPU
// in production (INFRASTRUCTURE.md §6).
const responseValidationProviders: Provider[] =
  env.NODE_ENV !== "production"
    ? [{ provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor }]
    : [];

@Module({
  imports: [
    ConfigModule,
    PinoLoggerModule,
    DatabaseModule,
    RedisModule,
    AuthModule,
    HealthModule,
    OrganizationModule,
    IamModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    ...responseValidationProviders,
  ],
})
export class AppModule {}
