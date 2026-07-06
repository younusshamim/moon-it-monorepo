// GET /health — aggregates the Postgres and Redis liveness probes (INFRASTRUCTURE.md §6). Also
// exposes the container-orchestration split: /health/live (process is up, no dependency checks) and
// /health/ready (same DB + Redis checks as /health) so a Redis/DB blip only fails readiness, not
// liveness — an orchestrator restarting the process on a dependency blip won't help and just adds
// churn.
import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
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

  @Get("live")
  @HttpCode(HttpStatus.OK)
  live(): { status: "ok" } {
    return { status: "ok" };
  }

  @Get("ready")
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.database.isHealthy("database"),
      () => this.redis.isHealthy("redis"),
    ]);
  }
}
