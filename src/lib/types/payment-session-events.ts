// Pushed by GET /payment-sessions/:session_id/events (public, session-scoped).

export interface PaymentPartialEvent {
  session_id: string;
  amount_paid: number;
  amount_due: number | null;
  currency: string;
}

export interface PaymentCompletedEvent {
  session_id: string;
  amount_paid: number;
  currency: string;
  completed_at: string;
}

export interface PaymentFailedEvent {
  session_id: string;
  reason?: string;
  currency: string;
}
