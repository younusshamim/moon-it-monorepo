// OpenTelemetry tracer stub (INFRASTRUCTURE.md §11). Tracing is wired but inert by default; it only
// boots when OTEL_EXPORTER_OTLP_ENDPOINT is set, at which point the NodeSDK auto-instruments
// HTTP/DB/Redis and exports over OTLP (endpoint read from env by the SDK). Real span tuning lands
// alongside the first traced feature module.
import type { NodeSDK } from "@opentelemetry/sdk-node";
import { env } from "./config/env.js";

let sdk: NodeSDK | undefined;

export async function startTracing(): Promise<void> {
  if (!env.OTEL_EXPORTER_OTLP_ENDPOINT) return;

  const { NodeSDK } = await import("@opentelemetry/sdk-node");
  const { getNodeAutoInstrumentations } = await import("@opentelemetry/auto-instrumentations-node");

  sdk = new NodeSDK({ instrumentations: [getNodeAutoInstrumentations()] });
  sdk.start();
}

export async function stopTracing(): Promise<void> {
  await sdk?.shutdown();
}
