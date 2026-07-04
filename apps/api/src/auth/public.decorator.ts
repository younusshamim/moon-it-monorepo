// `@Public()` opts a route out of the global AuthGuard (health probes, and anything that must answer
// before a session exists). AuthGuard reads this metadata via the Reflector. See INFRASTRUCTURE.md §9.
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/** Mark a controller or handler as reachable without authentication. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
