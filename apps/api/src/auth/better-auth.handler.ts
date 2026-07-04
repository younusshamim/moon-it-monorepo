// Mounts Better Auth's request handler on the raw Fastify instance at `/api/auth/*` (the base the web
// Better Auth client talks to — docs/API_AND_AUTH_PLAN.md Resolved decision #4). Registered directly on
// Fastify rather than as a Nest controller so it sits *outside* the global prefix (`/v1`), the global
// ZodValidationPipe, and the global AuthGuard — Better Auth owns its own request/response contract.
//
// Fastify has already parsed the JSON body by the time the handler runs, so we re-serialise it into a
// Fetch `Request` for `auth.handler` (the pattern from Better Auth's Fastify integration guide), and
// forward the Fetch `Response` back, preserving every `Set-Cookie` header via `getSetCookie()`.
import rateLimit from "@fastify/rate-limit";
import type { Auth } from "@moonit/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";

export async function registerBetterAuthHandler(
  fastify: FastifyInstance,
  auth: Auth,
): Promise<void> {
  // Rate-limit only the auth surface (sign-in/out) to blunt credential brute-force. `global: false`
  // keeps the limit off the rest of the API; the per-route `config.rateLimit` below applies it.
  await fastify.register(rateLimit, { global: false });

  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    config: {
      // ~20 requests/min per IP across all `/api/auth/*` endpoints → 429 beyond that.
      rateLimit: { max: 20, timeWindow: "1 minute" },
    },
    async handler(request, reply) {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const req = new Request(url, {
        method: request.method,
        headers: fromNodeHeaders(request.headers),
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      const response = await auth.handler(req);

      reply.status(response.status);
      for (const cookie of response.headers.getSetCookie()) {
        reply.header("set-cookie", cookie);
      }
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "set-cookie") reply.header(key, value);
      });
      return reply.send(response.body ? await response.text() : null);
    },
  });
}
