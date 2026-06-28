// Liveness probe for Postgres: runs a trivial `SELECT 1` through the injected Drizzle client.

import type { Database } from "@moonit/db";
import { Inject, Injectable } from "@nestjs/common";
import { type HealthIndicatorResult, HealthIndicatorService } from "@nestjs/terminus";
import { sql } from "drizzle-orm";
import { DRIZZLE } from "../database/database.tokens.js";

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    try {
      await this.db.execute(sql`select 1`);
      return indicator.up();
    } catch (error) {
      return indicator.down({ message: (error as Error).message });
    }
  }
}
