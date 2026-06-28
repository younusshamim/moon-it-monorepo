// Liveness probe for Redis: issues a PING through the injected ioredis connection.
import { Inject, Injectable } from "@nestjs/common";
import { type HealthIndicatorResult, HealthIndicatorService } from "@nestjs/terminus";
import type { Redis } from "ioredis";
import { REDIS } from "../redis/redis.tokens.js";

@Injectable()
export class RedisHealthIndicator {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    try {
      const pong = await this.redis.ping();
      if (pong !== "PONG") {
        return indicator.down({ message: `unexpected ping reply: ${pong}` });
      }
      return indicator.up();
    } catch (error) {
      return indicator.down({ message: (error as Error).message });
    }
  }
}
