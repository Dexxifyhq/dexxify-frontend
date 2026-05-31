import type { CryptoCurrency, TxStatus, PaginatedResponse } from "./common";

// ── Balance overview ───────────────────────────────────────────────────────

export interface BalanceOverview {
  total_paid_out: number;
  processing: number;
  available: number;
  currency: CryptoCurrency;
}

/**
 * Raw account-level balance from GET /balance (api-key realm). The response is
 * not typed in the OpenAPI spec, so this is kept permissive — refine the named
 * fields once the real shape is verified.
 */
export interface AccountBalance {
  total_balance?: number;
  available_balance?: number;
  pending_balance?: number;
  currency?: string;
  [key: string]: unknown;
}

// ── Balance history ────────────────────────────────────────────────────────

export type BalanceTxType = "credit" | "debit" | "swap" | "payout" | "fee";

export interface BalanceHistoryItem {
  id: string;
  reference: string;
  tx_hash?: string;
  type: BalanceTxType;
  amount: number;
  currency: CryptoCurrency;
  status: TxStatus;
  description: string;
  created_at: string;
}

export type BalanceHistoryResponse = PaginatedResponse<BalanceHistoryItem>;

// ── Swap ───────────────────────────────────────────────────────────────────

export interface SwapItem {
  id: string;
  from_currency: CryptoCurrency;
  to_currency: CryptoCurrency;
  from_amount: number;
  to_amount: number;
  rate: number;
  status: TxStatus;
  created_at: string;
}

// ── Payout ─────────────────────────────────────────────────────────────────

export interface PayoutItem {
  id: string;
  reference: string;
  amount: number;
  currency: CryptoCurrency;
  destination: string;
  status: TxStatus;
  created_at: string;
}

// ── Filters ────────────────────────────────────────────────────────────────

export interface BalanceHistoryFilters {
  page?: number;
  limit?: number;
  type?: BalanceTxType | "all";
  currency?: CryptoCurrency | "all";
  status?: TxStatus | "all";
  search?: string;
}
