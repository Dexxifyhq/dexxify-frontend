import { NextResponse } from "next/server";

/**
 * Route protection is handled CLIENT-SIDE — see src/app/(dashboard)/layout.tsx.
 *
 * Why not here?
 * The API session lives in an httpOnly cookie set by the API origin
 * (api.dexxify.com). Whenever the dashboard and the API are on different
 * origins (localhost in dev, and any split-domain deploy), middleware running
 * on the *frontend* origin cannot read that cookie. A cookie check here would
 * therefore see nothing and redirect every authenticated user back to /login —
 * the exact redirect loop we hit after a successful sign-in.
 *
 * Instead, the dashboard layout calls GET /auth/profile with credentials:
 *   200            → session valid, render the dashboard
 *   hard 401       → after the axios interceptor's refresh also fails, the user
 *                    is sent to /login
 *
 * This file is kept as a pass-through so the wiring stays in place if the
 * dashboard later moves onto the API's parent domain (Domain=.dexxify.com),
 * at which point edge gating on the cookie becomes possible again.
 */
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
