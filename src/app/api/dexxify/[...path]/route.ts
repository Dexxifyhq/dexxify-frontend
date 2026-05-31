import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side BFF proxy for the Dexxify business API.
 *
 * Why this exists:
 * Every data endpoint (/wallets, /transactions, /balance, /payouts, /kyc, …)
 * is guarded by `Authorization: Bearer <api_key>`. That key authorizes money
 * movement (payouts, withdrawals), so it must NEVER reach browser JavaScript,
 * where any XSS or extension could lift it. This handler runs only on the
 * server: it attaches DEXXIFY_API_KEY and forwards the request, keeping the
 * secret out of the client bundle and the Network tab.
 *
 * Flow: browser → /api/dexxify/<path> → (this route, adds key) → API_BASE/<path>
 *
 * Multi-tenant note: today the key comes from one server env var, which fits a
 * single-business deployment. For a multi-tenant dashboard, replace
 * resolveApiKey() with a per-user lookup (session cookie → user → stored key).
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.dexxify.com/api/v1";

function resolveApiKey(): string | undefined {
  return process.env.DEXXIFY_API_KEY;
}

async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        status: 500,
        message:
          "DEXXIFY_API_KEY is not configured on the server. Add it to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  const { path = [] } = await ctx.params;
  const target = `${API_BASE}/${path.join("/")}${req.nextUrl.search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };
  const incomingContentType = req.headers.get("content-type");
  if (incomingContentType) headers["Content-Type"] = incomingContentType;

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.text() : undefined;
  if (hasBody && body && !incomingContentType) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: body && body.length ? body : undefined,
      cache: "no-store",
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: 502,
        message: "Upstream request to the Dexxify API failed.",
      },
      { status: 502 },
    );
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
