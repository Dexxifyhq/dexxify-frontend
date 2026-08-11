import type { PaginatedResponse } from "./common";

// ── Ledger ─────────────────────────────────────────────────────────────────

export type LedgerTxType =
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "onramp"
  | "offramp"
  | "payout"
  | "fee"
  | "swap"
  | "refund";

export type LedgerEntryStatus =
  | "initiated"
  | "pending"
  | "completed"
  | "processing"
  | "rejected"
  | "reversed";

export interface LedgerTransaction {
  id: string;
  developer_id: string;
  tx_type: LedgerTxType;
  // wallet_address: string | null;
  reference_type: string;
  reference_id: string;
  debit_ngn: number;
  credit_ngn: number;
  debit_usdt: number;
  credit_usdt: number;
  debit_usdc: number;
  credit_usdc: number;
  asset: string | null;
  currency: string | null;
  status: LedgerEntryStatus;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type LedgerTransactionList = PaginatedResponse<LedgerTransaction>;

// ── Balance ─────────────────────────────────────────────────────────────────

export interface LedgerBalance {
  ngn: { credits: number; debits: number; balance: number };
  usdt: { credits: number; debits: number; balance: number };
  usdc: { credits: number; debits: number; balance: number };
  synced_at: string;
}

// ── Settlement report ───────────────────────────────────────────────────────

export interface SettlementReport {
  summary: {
    date: string;
    total_entries: number;
    total_debits_ngn: number;
    total_credits_ngn: number;
    total_debits_usdt: number;
    total_credits_usdt: number;
    total_debits_usdc: number;
    total_credits_usdc: number;
    by_type: Record<
      string,
      {
        count: number;
        debit_ngn: number;
        credit_ngn: number;
        debit_usdt: number;
        credit_usdt: number;
        debit_usdc: number;
        credit_usdc: number;
      }
    >;
  };
  entries: LedgerTransaction[];
}

// ── Filters ─────────────────────────────────────────────────────────────────

export interface LedgerFilters {
  tx_type?: LedgerTxType;
  reference_type?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface SettlementReportFilters {
  date?: string;
}
