import { get, post } from "@/lib/api-client";

// ── Enums ────────────────────────────────────────────────────────────────────

export type SwapFromCurrency =
  | "NGN"
  | "USDT"
  | "USDC"
  | "ETH"
  | "BNB"
  | "SOL"
  | "TRX";

export type SwapQuotationCurrency = "NGN" | "USDT" | "USDC";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SwapEstimate {
  fromCurrency: string;
  toCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  [key: string]: unknown;
}

export interface SwapQuotation {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  expiresAt: string;
  status: string;
  [key: string]: unknown;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const swapsApi = {
  /** GET /swaps/estimate?fromCurrency=&toCurrency=&amount= */
  estimate: (
    fromCurrency: string,
    toCurrency: string,
    amount: number | string,
  ) =>
    get<SwapEstimate>("/swaps/estimate", {
      fromCurrency,
      toCurrency,
      amount: Number(amount),
    }),

  /** POST /swaps/quotation */
  createQuotation: (
    fromCurrency: string,
    toCurrency: string,
    amount: number | string,
  ) =>
    post<SwapQuotation>("/swaps/quotation", {
      fromCurrency,
      toCurrency,
      amount: Number(amount),
    }),

  /** POST /swaps/quotation/:quotationId/execute */
  executeQuotation: (quotationId: string) =>
    post<{ id: string; status: string; [key: string]: unknown }>(
      `/swaps/quotation/${quotationId}/execute`,
    ),

  /** GET /swaps */
  list: (page = 1, size = 20) => get<unknown>("/swaps", { page, size }),

  /** GET /swaps/:id */
  findOne: (id: string) => get<unknown>(`/swaps/${id}`),
};
