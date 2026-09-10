export const REALTIME_EVENT_TYPES = [
  "payment.completed",
  "payment.partial",
  "payment.expired",
  "payment.failed",
  "transaction.received",
  "transaction.confirmed",
  "deposit.processing",
  "deposit.confirmed",
  "deposit.failed",
  "swap.completed",
  "swap.failed",
  "offramp.processing",
  "offramp.completed",
  "offramp.failed",
  "payout.created",
  "payout.success",
  "payout.failed",
  "refund.created",
  "refund.success",
  "refund.failed",
] as const;

export type RealtimeEventType = (typeof REALTIME_EVENT_TYPES)[number];
