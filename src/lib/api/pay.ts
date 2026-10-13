/**
 * Public payment API — called from customer-facing pages.
 * Uses publicClient (no auth cookies).
 */
import { publicGet, publicPost } from "@/lib/api-public";
import { get, post } from "@/lib/api-client";

export const payApi = {
  // ── Checkout sessions ────────────────────────────────────────────────────

  // GET /payment-sessions/:session_id — public, no auth needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped session response
  getSession: (sessionId: string) => get<any>(`/payment-sessions/${sessionId}`),

  // POST /payment-sessions/:session_id/deposit-address — pick asset/network
  generateDepositAddress: (
    sessionId: string,
    payload: { crypto_asset: string; network: string },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped response
  ) => post<any>(`/payment-sessions/${sessionId}/deposit-address`, payload),

  // ── Payment pages ────────────────────────────────────────────────────────

  // GET /p/:slug — public page details (title, description, amount, etc.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped response
  getPage: (slug: string) => publicGet<any>(`/p/${slug}`),

  // POST /p/:slug/pay — customer submits on a payment page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped request/response
  initiatePagePayment: (slug: string, payload: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped response
    publicPost<any>(`/p/${slug}/pay`, payload),

  // ── Shared ───────────────────────────────────────────────────────────────

  // GET /misc/assets — available tokens (public)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped response
  getDepositAssets: () => publicGet<any>("/misc/assets"),
};
