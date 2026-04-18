import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://docs.dexxify.com/api/v1";

// Shared cookie defaults — httpOnly so JS can never read the refresh token
const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * POST /api/auth/session
 * Proxies the login call to the backend, stores the refresh token in an
 * httpOnly cookie, and returns only the short-lived access token to the
 * client (where it lives in memory — never in localStorage).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const upstream = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      const msg = Array.isArray(err.message) ? err.message[0] : (err.message ?? "Invalid credentials");
      return NextResponse.json({ message: msg }, { status: upstream.status });
    }

    const tokens: { access_token: string; refresh_token?: string } =
      await upstream.json();

    // Only send the access_token to the browser — refresh token stays server-side
    const response = NextResponse.json({ access_token: tokens.access_token });

    // Presence flag — proxy.ts reads this to protect /dashboard routes
    response.cookies.set("__dexxify_session", "1", COOKIE_DEFAULTS);

    // Refresh token — httpOnly, 30-day lifespan, never exposed to JS
    if (tokens.refresh_token) {
      response.cookies.set("__dexxify_rt", tokens.refresh_token, {
        ...COOKIE_DEFAULTS,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
