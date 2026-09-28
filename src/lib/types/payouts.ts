export type PayoutStatus = "pending" | "processing" | "completed" | "failed";

export interface Payout {
  id: string;
  amount: number;
  fee: number;
  currency: string;
  bank_code: string | null;
  account_number: string | null;
  account_name: string | null;
  narration: string | null;
  status: PayoutStatus;
  provider_reference: string | null;
  provider_payout_id: string | null;
  failure_reason: string | null;
  metadata?: Record<string, unknown>;
  completed_at: string | null;
  created_at: string;
  updated_at?: string;
}
