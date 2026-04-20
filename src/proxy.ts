import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Server-side route protection.
 *
 * Auth tokens are stored in httpOnly cookies.
 * This runs on the edge — before any HTML is rendered — so unauthenticated
 * users are redirected to /login with zero flash.
 */

// const PRIVATE_PATHS = [
//   "/dashboard",
// ];

const AUTH_PATHS = ["/login"];

function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete("access_token");
  return response;
}

export function proxy(request: NextRequest) {
  // const hasSession = request.cookies.has('__dexxify_session');
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  console.log('access_token', token);
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));
  // const isPrivatePath = PRIVATE_PATHS.some(p => pathname.startswith(p))

  // Protect all /dashboard/* routes
  if (pathname.startsWith("/dashboard") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname); // preserve intended destination
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
