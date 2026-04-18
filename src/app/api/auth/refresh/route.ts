import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://docs.dexxify.com/api/v1";

const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * POST /api/auth/refresh
 * Called by the Axios 401 interceptor (api-client.ts) when an access token
 * expires. Reads the httpOnly refresh token cookie, exchanges it with the
 * backend, rotates the cookie if the backend issues a new refresh token,
 * and returns only the new access token to the client.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("__dexxify_rt")?.value;

  if (!refreshToken) {
    // __dexxify_rt is missing — clear the session flag too so proxy.ts stops
    // letting the user into /dashboard and the redirect to /login sticks.
    const response = NextResponse.json({ message: "No session" }, { status: 401 });
    response.cookies.set("__dexxify_session", "", { ...COOKIE_DEFAULTS, maxAge: 0 });
    return response;
  }

  try {
    const upstream = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!upstream.ok) {
      // Refresh rejected — clear session so proxy.ts redirects to login
      const response = NextResponse.json(
        { message: "Session expired" },
        { status: 401 }
      );
      response.cookies.set("__dexxify_session", "", { ...COOKIE_DEFAULTS, maxAge: 0 });
      response.cookies.set("__dexxify_rt", "", { ...COOKIE_DEFAULTS, maxAge: 0 });
      return response;
    }

    const tokens: { access_token: string; refresh_token?: string } =
      await upstream.json();

    const response = NextResponse.json({ access_token: tokens.access_token });

    // Rotate refresh token if the backend issues a new one
    if (tokens.refresh_token) {
      response.cookies.set("__dexxify_rt", tokens.refresh_token, {
        ...COOKIE_DEFAULTS,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ message: "Refresh failed" }, { status: 500 });
  }
}
