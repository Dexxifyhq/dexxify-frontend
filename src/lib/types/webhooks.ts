// ── Webhooks ───────────────────────────────────────────────────────────────

export type WebhookEvent =
  | "wallet.deposit.confirmed"
  | "wallet.withdrawal.completed"
  | "offramp.completed"
  | "offramp.failed"
  | "onramp.completed"
  | "onramp.failed"
  | "payout.completed"
  | "payout.failed"
  | "kyc.verified"
  | "kyc.failed"
  | string; // allow forward compatibility

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  description?: string;
  secret?: string;
  active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateWebhookDto {
  url: string;
  events: WebhookEvent[];
  description?: string;
}
