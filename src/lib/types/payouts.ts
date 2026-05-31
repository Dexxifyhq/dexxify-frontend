import type { TxStatus } from "./common";

// ── Payout ─────────────────────────────────────────────────────────────────

export interface Payout {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  bank_code: string;
  account_number: string;
  account_name?: string;
  narration?: string;
  status: TxStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface ResolvedAccount {
  bank_code: string;
  account_number: string;
  account_name: string;
}

export interface BatchPayoutResult {
  total: number;
  succeeded: number;
  failed: number;
  payouts: Payout[];
}

// ── DTOs ───────────────────────────────────────────────────────────────────

export interface CreatePayoutDto {
  amount: number;
  bank_code: string;
  account_number: string;
  account_name?: string;
  narration?: string;
  metadata?: Record<string, unknown>;
}

export interface BatchPayoutDto {
  payouts: CreatePayoutDto[];
}

export interface ResolveAccountDto {
  bank_code: string;
  account_number: string;
}
