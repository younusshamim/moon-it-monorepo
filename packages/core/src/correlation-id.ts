// A correlation id ties together every log line, job, and AI call for one request (INFRASTRUCTURE.md §11).
// Uses the global Web Crypto API (Node 19+, browsers, edge) so @moonit/core stays runtime-agnostic —
// importing it never drags a Node-only module (`node:crypto`) into a client bundle.
export function generateCorrelationId(): string {
  return globalThis.crypto.randomUUID();
}
