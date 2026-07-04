// Wires authentication: builds the Better Auth instance from injected env + Drizzle, mounts its request
// handler at `/api/auth/*`, and registers the global AuthGuard. Importing this module makes every Nest
// route require a session (opt out with `@Public()`). See docs/API_AND_AUTH_PLAN.md Phase 5.
import { type Auth, createAuth } from "@moonit/auth";
import type { Database } from "@moonit/db";
import { Inject, Module, type OnModuleInit } from "@nestjs/common";
import { APP_GUARD, HttpAdapterHost } from "@nestjs/core";
import type { FastifyInstance } from "fastify";
import { ENV, type Env } from "../config/config.module.js";
import { DRIZZLE } from "../database/database.tokens.js";
import { AuthGuard } from "./auth.guard.js";
import { AUTH } from "./auth.tokens.js";
import { registerBetterAuthHandler } from "./better-auth.handler.js";
import { MeController } from "./me.controller.js";
import { PermissionsGuard } from "./permissions.guard.js";
import { PermissionsService } from "./permissions.service.js";
import { SessionService } from "./session.service.js";

@Module({
  controllers: [MeController],
  providers: [
    {
      provide: AUTH,
      inject: [ENV, DRIZZLE],
      useFactory: (env: Env, db: Database): Auth => {
        const trustedOrigins = env.WEB_ORIGIN?.split(",")
          .map((origin) => origin.trim())
          .filter(Boolean);
        return createAuth({
          db,
          secret: env.BETTER_AUTH_SECRET,
          ...(env.BETTER_AUTH_URL ? { baseURL: env.BETTER_AUTH_URL } : {}),
          ...(trustedOrigins && trustedOrigins.length > 0 ? { trustedOrigins } : {}),
        });
      },
    },
    SessionService,
    PermissionsService,
    // Order matters: AuthGuard runs first (sets request.user), then PermissionsGuard reads it. Nest
    // executes multiple APP_GUARD providers in declaration order within a module.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [AUTH],
})
export class AuthModule implements OnModuleInit {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @Inject(AUTH) private readonly auth: Auth,
  ) {}

  // Mount the Better Auth handler on the underlying Fastify instance once the adapter exists but before
  // the server starts listening. It lives outside Nest's routing (no global prefix / guard / pipe) and
  // registers its own rate-limit plugin, so this is async.
  async onModuleInit(): Promise<void> {
    const fastify = this.adapterHost.httpAdapter.getInstance<FastifyInstance>();
    await registerBetterAuthHandler(fastify, this.auth);
  }
}
