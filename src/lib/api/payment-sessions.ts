import { get, post } from "@/lib/api-client";

export const paymentSessionsApi = {
  // GET /payment-sessions
  list: () => get<any>("/payment-sessions"),

  // POST /payment-sessions
  create: (payload: any) => post<any>("/payment-sessions", payload),

  // GET /payment-sessions/{session_id}
  getById: (sessionId: string) => get<any>(`/payment-sessions/${sessionId}`),

  // GET /payment-sessions/ref/{reference}
  getByReference: (reference: string) =>
    get<any>(`/payment-sessions/ref/${reference}`),

  // POST /payment-sessions/{session_id}/cancel
  cancel: (sessionId: string) =>
    post<any>(`/payment-sessions/${sessionId}/cancel`),
};
