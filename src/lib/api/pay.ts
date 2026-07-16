/**
 * Public payment API — called from customer-facing pages.
 * Uses publicClient (no auth cookies).
 */
import { publicGet, publicPost } from "@/lib/api-public";
import { get, post } from "@/lib/api-client";

export const payApi = {
  // ── Checkout sessions ────────────────────────────────────────────────────

  // GET /payment-sessions/:session_id — public, no auth needed
  getSession: (sessionId: string) => get<any>(`/payment-sessions/${sessionId}`),

  // POST /payment-sessions/:session_id/deposit-address — pick asset/network
  generateDepositAddress: (
    sessionId: string,
    payload: { crypto_asset: string; network: string },
  ) => post<any>(`/payment-sessions/${sessionId}/deposit-address`, payload),

  // ── Payment pages ────────────────────────────────────────────────────────

  // GET /p/:slug — public page details (title, description, amount, etc.)
  getPage: (slug: string) => publicGet<any>(`/p/${slug}`),

  // POST /p/:slug/pay — customer submits on a payment page
  initiatePagePayment: (slug: string, payload: any) =>
    publicPost<any>(`/p/${slug}/pay`, payload),

  // ── Shared ───────────────────────────────────────────────────────────────

  // GET /misc/assets — available tokens (public)
  getDepositAssets: () => publicGet<any>("/misc/assets"),
};
