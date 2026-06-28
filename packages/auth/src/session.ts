// Optimistic session helpers for the edge. Better Auth stores the session token in a cookie;
// the Next.js proxy (middleware) reads it for a cheap "is there *probably* a session" check to gate
// route groups, while the real verification always happens server-side on every request/mutation
// (INFRASTRUCTURE.md §9). Framework-agnostic: callers pass any cookie accessor (NextRequest.cookies,
// the result of next/headers `cookies()`, etc.).

// Better Auth's default session cookie name, plus the `__Secure-` prefixed variant it uses over HTTPS.
export const SESSION_COOKIE_NAME = "better-auth.session_token";
export const SECURE_SESSION_COOKIE_NAME = `__Secure-${SESSION_COOKIE_NAME}`;

export interface CookieAccessor {
  get(name: string): { value: string } | undefined;
}

/** The raw session token if present (checking both the plain and `__Secure-` cookie), else null. */
export function getSessionToken(cookies: CookieAccessor): string | null {
  return (
    cookies.get(SESSION_COOKIE_NAME)?.value ??
    cookies.get(SECURE_SESSION_COOKIE_NAME)?.value ??
    null
  );
}

/**
 * Optimistic check: does the request carry a session cookie at all? This is *not* a security
 * boundary — it only decides whether to show the app shell or bounce to /login. Authorization is
 * enforced server-side (INFRASTRUCTURE.md §9, §15).
 */
export function hasSession(cookies: CookieAccessor): boolean {
  return getSessionToken(cookies) !== null;
}
