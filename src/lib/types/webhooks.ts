// ── Webhooks ───────────────────────────────────────────────────────────────
// A business has exactly one webhook endpoint per mode (live/test) — matches
// WebhooksController: GET/PUT/DELETE /webhooks all act on the endpoint for
// whichever mode the authenticated session is currently in.

export const WEBHOOK_EVENT_TYPES = [
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

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export type WebhookEventStatus = "pending" | "delivered" | "failed";

export interface WebhookEndpoint {
  configured: boolean;
  id: string | null;
  url: string | null;
  secret: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface SaveWebhookDto {
  url?: string;
  is_active?: boolean;
}

export interface RegenerateSecretResponse {
  id: string;
  secret: string;
}

export interface RemoveWebhookResponse {
  deleted: boolean;
}

// ── Webhook delivery events ──────────────────────────────────────────────

export interface WebhookDeliveryEvent {
  id: string;
  webhook_endpoint_id: string;
  event_type: WebhookEventType | string;
  status: WebhookEventStatus;
  attempts: number;
  response_status?: number;
  last_attempt_at?: string;
  delivered_at?: string;
  next_retry_at?: string;
  created_at: string;
}

export interface WebhookDeliveryEventDetail extends WebhookDeliveryEvent {
  business_id: string;
  payload: Record<string, unknown>;
  response_body?: string;
}

export interface ListWebhookEventsParams {
  page?: number;
  limit?: number;
  status?: WebhookEventStatus;
}
