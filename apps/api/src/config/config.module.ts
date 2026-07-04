// Exposes the validated `env` object as an injectable provider so feature code can depend on
// configuration through DI without importing the module directly.
import { Global, Module } from "@nestjs/common";
import { type Env, env } from "./env.js";

/** Injection token for the validated environment. Inject with `@Inject(ENV) env: Env`. */
export const ENV = "ENV";

export type { Env };

@Global()
@Module({
  providers: [{ provide: ENV, useValue: env }],
  exports: [ENV],
})
export class ConfigModule {}
