// ── API envelope ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

// ── Pagination ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ── Date range ─────────────────────────────────────────────────────────────

export type DateRange = "7d" | "30d" | "90d" | "1y" | "all";

// ── Currency ───────────────────────────────────────────────────────────────

export type FiatCurrency = "USD" | "NGN";
export type CryptoCurrency = "USDT" | "USDC" | "BTC" | "ETH" | "BNB";
export type Currency = FiatCurrency | CryptoCurrency;

// ── Environment ────────────────────────────────────────────────────────────

export type Environment = "test" | "live";

// ── Status ─────────────────────────────────────────────────────────────────

export type TxStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";
