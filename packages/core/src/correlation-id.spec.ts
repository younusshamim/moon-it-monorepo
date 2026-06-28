import { describe, expect, it } from "vitest";
import { generateCorrelationId } from "./correlation-id.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("generateCorrelationId", () => {
  it("returns a UUID v4 string", () => {
    expect(generateCorrelationId()).toMatch(UUID_RE);
  });

  it("returns unique values on each call", () => {
    expect(generateCorrelationId()).not.toBe(generateCorrelationId());
  });
});
