// Provides a shared ioredis connection as a DI provider (INFRASTRUCTURE.md §6). `maxRetriesPerRequest:
// null` keeps it compatible with BullMQ, which will reuse this connection for queues/workers later.
import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import { Redis } from "ioredis";
import { ENV, type Env } from "../config/config.module.js";
import { REDIS } from "./redis.tokens.js";

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ENV],
      useFactory: (env: Env): Redis => new Redis(env.REDIS_URL, { maxRetriesPerRequest: null }),
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}
