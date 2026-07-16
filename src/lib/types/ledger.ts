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
  wallet_address: string | null;
  reference_type: string;
  reference_id: string;
  debit_ngn: number;
  credit_ngn: number;
  debit_usd: number;
  credit_usd: number;
  asset: string | null;
  status: LedgerEntryStatus;
  amount_usd: number | null;
  amount_crypto: number | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type LedgerTransactionList = PaginatedResponse<LedgerTransaction>;

// ── Balance ─────────────────────────────────────────────────────────────────

export interface LedgerBalance {
  ngn: { credits: number; debits: number; balance: number };
  usd: { credits: number; debits: number; balance: number };
  synced_at: string;
}

// ── Settlement report ───────────────────────────────────────────────────────

export interface SettlementReport {
  summary: {
    date: string;
    total_entries: number;
    total_debits_ngn: number;
    total_credits_ngn: number;
    total_debits_usd: number;
    total_credits_usd: number;
    by_type: Record<
      string,
      { count: number; debit_ngn: number; credit_ngn: number; debit_usd: number; credit_usd: number }
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
