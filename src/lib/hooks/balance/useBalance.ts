import { useQuery } from "@tanstack/react-query";
import { balanceApi } from "@/lib/api/balance";
import type { BalanceHistoryFilters } from "@/lib/types/balance";
import type { CryptoCurrency } from "@/lib/types/common";

export const balanceKeys = {
  all: ["balance"] as const,
  overview: (currency: CryptoCurrency) => [...balanceKeys.all, "overview", currency] as const,
  history: (filters: BalanceHistoryFilters) => [...balanceKeys.all, "history", filters] as const,
  swaps: (page: number) => [...balanceKeys.all, "swaps", page] as const,
  payouts: (page: number) => [...balanceKeys.all, "payouts", page] as const,
};

export function useBalanceOverview(currency: CryptoCurrency = "USDT") {
  return useQuery({
    queryKey: balanceKeys.overview(currency),
    queryFn: () => balanceApi.getOverview(currency),
    staleTime: 20_000,
    refetchInterval: 60_000,
  });
}

export function useBalanceHistory(filters: BalanceHistoryFilters = {}) {
  return useQuery({
    queryKey: balanceKeys.history(filters),
    queryFn: () => balanceApi.getHistory(filters),
    staleTime: 15_000,
  });
}

export function useSwaps(page = 1) {
  return useQuery({
    queryKey: balanceKeys.swaps(page),
    queryFn: () => balanceApi.getSwaps(page),
    staleTime: 15_000,
  });
}

export function usePayouts(page = 1) {
  return useQuery({
    queryKey: balanceKeys.payouts(page),
    queryFn: () => balanceApi.getPayouts(page),
    staleTime: 15_000,
  });
}
