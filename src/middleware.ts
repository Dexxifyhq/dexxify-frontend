import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth is handled client-side via localStorage (see (dashboard)/layout.tsx).
 * This middleware is a placeholder — cookie-based protection can be added
 * once the login flow is updated to also write a `dexxify_token` cookie.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
