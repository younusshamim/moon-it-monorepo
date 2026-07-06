// Writes the OpenAPI document to disk (`apps/api/openapi.json`) so the spec is diffable in PRs and
// usable by external consumers without running the API. Reuses `createOpenApiDocument` from
// `openapi.ts`, the same helper `main.ts` uses for the live `/docs` route, so the two can't drift.
import "reflect-metadata";

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { AppModule } from "./app.module.js";
import { applyGlobalPrefix } from "./global-prefix.js";
import { createOpenApiDocument } from "./openapi.js";

const OUTPUT_PATH = fileURLToPath(new URL("../openapi.json", import.meta.url));

async function main(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: false,
  });

  // Match main.ts's prefix so the exported spec's paths (`/v1/...`) reflect the real API.
  applyGlobalPrefix(app);

  const document = createOpenApiDocument(app);
  await writeFile(OUTPUT_PATH, `${JSON.stringify(cleanupOpenApiDoc(document), null, 2)}\n`);

  await app.close();
}

void main();
