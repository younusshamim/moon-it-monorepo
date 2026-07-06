// Shared `/v1` global-prefix setup, used by both the live app (main.ts) and the OpenAPI exporter
// (openapi-export.ts) so their route shapes — and therefore the exported spec's paths — can't drift.
import { type INestApplication, RequestMethod } from "@nestjs/common";

export function applyGlobalPrefix(app: INestApplication): void {
  // `/health` and its `live`/`ready` sub-routes stay unprefixed for orchestrator/web probes
  // (docs/API_AND_AUTH_PLAN.md, Phase 0). `exclude` only matches exact paths, not sub-routes, so
  // each health path is listed explicitly.
  app.setGlobalPrefix("v1", {
    exclude: [
      { path: "health", method: RequestMethod.ALL },
      { path: "health/live", method: RequestMethod.ALL },
      { path: "health/ready", method: RequestMethod.ALL },
    ],
  });
}
