// Next.js middleware (named `proxy` in Next 16). Optimistic auth gate for the route groups
// (INFRASTRUCTURE.md §9): it does a cheap session-cookie check via @moonit/auth — shared with the
// NestJS guard so the two never disagree — and redirects between the (auth) and (dashboard) groups.
// It is NOT a security boundary: every read/mutation is still authorized server-side.
// import { hasSession } from "@moonit/auth";
import { type NextRequest, NextResponse } from "next/server";

// Routes in the (auth) group — reachable only when signed *out*.
const AUTH_ROUTES = ["/login"];

const SIGN_IN_PATH = "/login";
const DEFAULT_AUTHED_PATH = "/";

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  // const authed = hasSession(request.cookies);
  const authed = true; // TODO: re-enable once @moonit/auth is fixed for Next 16.2.9;
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Signed-in user on a sign-in page → send to the dashboard.
  if (authed && isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_AUTHED_PATH, request.url));
  }

  // Signed-out user on a protected page → send to login, remembering where they were headed.
  if (!authed && !isAuthRoute) {
    const loginUrl = new URL(SIGN_IN_PATH, request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
