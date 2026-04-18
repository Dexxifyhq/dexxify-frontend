import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Server-side route protection.
 *
 * Auth tokens are stored in httpOnly cookies (set by /api/auth/session and
 * /api/auth/refresh). The presence of __dexxify_session tells us the user
 * has an active session without exposing any token value.
 *
 * This runs on the edge — before any HTML is rendered — so unauthenticated
 * users are redirected to /login with zero flash.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("__dexxify_session");

  // Protect all /dashboard/* routes
  if (pathname.startsWith("/dashboard") && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname); // preserve intended destination
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
