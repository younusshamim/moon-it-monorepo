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
import { SessionService } from "./session.service.js";

@Module({
  providers: [
    {
      provide: AUTH,
      inject: [ENV, DRIZZLE],
      useFactory: (env: Env, db: Database): Auth =>
        createAuth({
          db,
          secret: env.BETTER_AUTH_SECRET,
          ...(env.BETTER_AUTH_URL ? { baseURL: env.BETTER_AUTH_URL } : {}),
        }),
    },
    SessionService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [AUTH],
})
export class AuthModule implements OnModuleInit {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @Inject(AUTH) private readonly auth: Auth,
  ) {}

  // Mount the Better Auth handler on the underlying Fastify instance once the adapter exists but before
  // the server starts listening. It lives outside Nest's routing (no global prefix / guard / pipe).
  onModuleInit(): void {
    const fastify = this.adapterHost.httpAdapter.getInstance<FastifyInstance>();
    registerBetterAuthHandler(fastify, this.auth);
  }
}
