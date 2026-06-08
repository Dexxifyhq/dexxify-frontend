/**
 * Public payment API — called from customer-facing pages.
 * Uses publicClient (no auth cookies).
 */
import { publicGet, publicPost } from "@/lib/api-public";

export const payApi = {
  // ── Checkout sessions ────────────────────────────────────────────────────

  // GET /payment-sessions/:session_id — session details for customer
  getSession: (sessionId: string) =>
    publicGet<any>(`/payment-sessions/${sessionId}`),

  // POST /payment-sessions/:session_id/pay — customer initiates payment
  initiateSessionPayment: (sessionId: string, payload: any) =>
    publicPost<any>(`/payment-sessions/${sessionId}/pay`, payload),

  // ── Payment pages ────────────────────────────────────────────────────────

  // GET /p/:slug — public page details (title, description, amount, etc.)
  getPage: (slug: string) => publicGet<any>(`/p/${slug}`),

  // POST /p/:slug/pay — customer submits on a payment page
  initiatePagePayment: (slug: string, payload: any) =>
    publicPost<any>(`/p/${slug}/pay`, payload),

  // ── Shared ───────────────────────────────────────────────────────────────

  // GET /misc/deposit-assets — available tokens (public)
  getDepositAssets: () => publicGet<any>("/misc/deposit-assets"),
};
