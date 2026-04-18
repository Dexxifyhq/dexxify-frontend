import { get } from "@/lib/api-client";
import type { BalanceOverview, BalanceHistoryResponse, SwapItem, PayoutItem, BalanceHistoryFilters } from "@/lib/types/balance";
import type { CryptoCurrency, PaginatedResponse } from "@/lib/types/common";

export const balanceApi = {
  getOverview: (currency: CryptoCurrency = "USDT") =>
    get<BalanceOverview>("/balance/overview", { currency }),

  getHistory: (filters: BalanceHistoryFilters = {}) =>
    get<BalanceHistoryResponse>("/balance/history", {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      ...(filters.type && filters.type !== "all" ? { type: filters.type } : {}),
      ...(filters.currency && filters.currency !== "all" ? { currency: filters.currency } : {}),
      ...(filters.status && filters.status !== "all" ? { status: filters.status } : {}),
      ...(filters.search ? { search: filters.search } : {}),
    }),

  getSwaps: (page = 1, limit = 20) =>
    get<PaginatedResponse<SwapItem>>("/balance/swaps", { page, limit }),

  getPayouts: (page = 1, limit = 20) =>
    get<PaginatedResponse<PayoutItem>>("/balance/payouts", { page, limit }),
};
