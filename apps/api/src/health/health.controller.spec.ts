import type { Database } from "@moonit/db";
import type { HealthCheckService, HealthIndicatorService } from "@nestjs/terminus";
import type { Redis } from "ioredis";
import { describe, expect, it, vi } from "vitest";
import { DatabaseHealthIndicator } from "./database.health.js";
import { HealthController } from "./health.controller.js";
import { RedisHealthIndicator } from "./redis.health.js";

// Minimal stand-in for HealthIndicatorService: `check(key)` returns an up/down session.
function fakeIndicatorService(): HealthIndicatorService {
  return {
    check: (key: string) => ({
      up: (data?: Record<string, unknown>) => ({ [key]: { status: "up", ...data } }),
      down: (data?: Record<string, unknown>) => ({ [key]: { status: "down", ...data } }),
    }),
  } as unknown as HealthIndicatorService;
}

describe("DatabaseHealthIndicator", () => {
  it("reports up when the query succeeds", async () => {
    const db = { execute: vi.fn().mockResolvedValue([]) } as unknown as Database;
    const indicator = new DatabaseHealthIndicator(db, fakeIndicatorService());

    await expect(indicator.isHealthy("database")).resolves.toEqual({
      database: { status: "up" },
    });
    expect(db.execute).toHaveBeenCalledOnce();
  });

  it("reports down when the query throws", async () => {
    const db = {
      execute: vi.fn().mockRejectedValue(new Error("connection refused")),
    } as unknown as Database;
    const indicator = new DatabaseHealthIndicator(db, fakeIndicatorService());

    await expect(indicator.isHealthy("database")).resolves.toEqual({
      database: { status: "down", message: "connection refused" },
    });
  });
});

describe("RedisHealthIndicator", () => {
  it("reports up on a PONG reply", async () => {
    const redis = { ping: vi.fn().mockResolvedValue("PONG") } as unknown as Redis;
    const indicator = new RedisHealthIndicator(redis, fakeIndicatorService());

    await expect(indicator.isHealthy("redis")).resolves.toEqual({
      redis: { status: "up" },
    });
  });

  it("reports down when ping throws", async () => {
    const redis = {
      ping: vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
    } as unknown as Redis;
    const indicator = new RedisHealthIndicator(redis, fakeIndicatorService());

    await expect(indicator.isHealthy("redis")).resolves.toEqual({
      redis: { status: "down", message: "ECONNREFUSED" },
    });
  });
});

describe("HealthController", () => {
  it("delegates to HealthCheckService with both indicators", async () => {
    const result = { status: "ok" };
    const health = { check: vi.fn().mockResolvedValue(result) } as unknown as HealthCheckService;
    const database = { isHealthy: vi.fn() } as unknown as DatabaseHealthIndicator;
    const redis = { isHealthy: vi.fn() } as unknown as RedisHealthIndicator;

    const controller = new HealthController(health, database, redis);

    await expect(controller.check()).resolves.toBe(result);
    const firstCall = (health.check as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(firstCall?.[0]).toHaveLength(2);
  });
});
