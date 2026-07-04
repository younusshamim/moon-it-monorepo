// GET /health — aggregates the Postgres and Redis liveness probes (INFRASTRUCTURE.md §6).
import { Controller, Get } from "@nestjs/common";
import { HealthCheck, type HealthCheckResult, HealthCheckService } from "@nestjs/terminus";
import { Public } from "../auth/public.decorator.js";
import { DatabaseHealthIndicator } from "./database.health.js";
import { RedisHealthIndicator } from "./redis.health.js";

@Public()
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.database.isHealthy("database"),
      () => this.redis.isHealthy("redis"),
    ]);
  }
}
