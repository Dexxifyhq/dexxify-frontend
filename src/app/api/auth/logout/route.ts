import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Clears both httpOnly session cookies. The client clears the in-memory
 * access token separately via clearMemoryToken().
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  const clear = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("__dexxify_session", "", clear);
  response.cookies.set("__dexxify_rt", "", clear);

  return response;
}
