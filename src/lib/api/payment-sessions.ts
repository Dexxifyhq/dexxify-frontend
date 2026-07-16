import { get, post } from "@/lib/api-client";

export const paymentSessionsApi = {
  // GET /payment-sessions
  list: () => get<any>("/payment-sessions"),

  // POST /payment-sessions
  create: (payload: any) => post<any>("/payment-sessions", payload),

  // GET /payment-sessions/{session_id}
  getById: (sessionId: string) => get<any>(`/payment-sessions/${sessionId}`),

  // POST /payment-sessions/estimate
  getEstimate: (payload: {
    amount: string;
    currency: string;
    crypto_asset: string;
    network: string;
    reference?: string;
  }) => post<any>("/payment-sessions/estimate", payload),

  // GET /payment-sessions/ref/{reference}
  getByReference: (reference: string) =>
    get<any>(`/payment-sessions/ref/${reference}`),

  // POST /payment-sessions/{session_id}/cancel
  cancel: (sessionId: string) =>
    post<any>(`/payment-sessions/${sessionId}/cancel`),
};
