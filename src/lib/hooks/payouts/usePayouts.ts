import { useQuery } from "@tanstack/react-query";
import { payoutsApi, type PayoutListParams } from "@/lib/api/payouts";

export const payoutKeys = {
  all: ["payouts-domain"] as const, // distinct from balance/payouts key
  list: (params: PayoutListParams) =>
    [...payoutKeys.all, "list", params] as const,
  detail: (payoutId: string) =>
    [...payoutKeys.all, "detail", payoutId] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

export function usePayout(payoutId: string) {
  return useQuery({
    queryKey: payoutKeys.detail(payoutId),
    queryFn: () => payoutsApi.getById(payoutId),
    enabled: !!payoutId,
    staleTime: 15_000,
  });
}

export function usePayouts(params: PayoutListParams = {}) {
  return useQuery({
    queryKey: payoutKeys.list(params),
    queryFn: () => payoutsApi.getList(params),
    staleTime: 15_000,
  });
}
