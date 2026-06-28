// Sentry initialisation, imported first in main.ts so instrumentation is in place before any other
// module loads (INFRASTRUCTURE.md §11). Stays a no-op when SENTRY_DSN is unset.
import * as Sentry from "@sentry/node";
import { env } from "./config/env.js";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
  });
}
