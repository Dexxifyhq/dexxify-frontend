import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payoutsApi } from "@/lib/api/payouts";
import type {
  BatchPayoutDto,
  CreatePayoutDto,
  ResolveAccountDto,
} from "@/lib/types/payouts";

export const payoutKeys = {
  all: ["payouts-domain"] as const, // distinct from balance/payouts key
  detail: (payoutId: string) => [...payoutKeys.all, "detail", payoutId] as const,
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

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreatePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePayoutDto) => payoutsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: payoutKeys.all });
    },
  });
}

export function useBatchPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BatchPayoutDto) => payoutsApi.createBatch(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: payoutKeys.all });
    },
  });
}

export function useResolveAccount() {
  return useMutation({
    mutationFn: (payload: ResolveAccountDto) =>
      payoutsApi.resolveAccount(payload),
  });
}
