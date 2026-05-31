import type { TxStatus, PaginatedResponse } from "./common";

// ── Ledger ─────────────────────────────────────────────────────────────────

export type LedgerTxType =
  | "deposit"
  | "withdrawal"
  | "swap"
  | "payout"
  | "fee"
  | "credit"
  | "debit"
  | "onramp"
  | "offramp";

export type LedgerReferenceType =
  | "wallet"
  | "payout"
  | "onramp"
  | "offramp"
  | "swap";

export interface LedgerTransaction {
  id: string;
  reference: string;
  tx_hash?: string;
  tx_type: LedgerTxType;
  reference_type?: LedgerReferenceType;
  reference_id?: string;
  currency: string;
  amount: number;
  balance_before?: number;
  balance_after?: number;
  status: TxStatus;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type LedgerTransactionList = PaginatedResponse<LedgerTransaction>;

export interface LedgerBalance {
  currency: string;
  available: number;
  pending: number;
  total: number;
  // when the backend returns multi-currency balances:
  balances?: Array<{
    currency: string;
    available: number;
    pending: number;
    total: number;
  }>;
}

export interface SettlementReport {
  date: string;
  total_settled: number;
  total_pending: number;
  total_failed: number;
  currency: string;
  entries: Array<{
    reference: string;
    amount: number;
    status: TxStatus;
    settled_at?: string;
  }>;
}

// ── Filters ────────────────────────────────────────────────────────────────

export interface LedgerFilters {
  tx_type?: LedgerTxType;
  currency?: string;
  reference_type?: LedgerReferenceType;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface SettlementReportFilters {
  date?: string;
}
