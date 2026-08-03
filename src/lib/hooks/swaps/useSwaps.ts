import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { swapsApi } from "@/lib/api/swaps";
import { offrampApi } from "@/lib/api/offramp";
import type { CreateOfframpDto } from "@/lib/api/offramp";
import { ledgerKeys } from "@/lib/hooks/ledger/useLedger";

// ── Query keys ────────────────────────────────────────────────────────────────

export const swapKeys = {
  all: ["swaps"] as const,
  list: (page: number, size: number) =>
    [...swapKeys.all, "list", page, size] as const,
  estimate: (from: string, to: string, amount: string) =>
    [...swapKeys.all, "estimate", from, to, amount] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useSwapEstimate(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
) {
  return useQuery({
    queryKey: swapKeys.estimate(fromCurrency, toCurrency, amount),
    queryFn: () =>
      swapsApi.estimate(fromCurrency, toCurrency, Number(amount)),
    enabled:
      !!fromCurrency &&
      !!toCurrency &&
      !!amount &&
      Number(amount) > 0 &&
      fromCurrency !== toCurrency,
    staleTime: 5_000,
  });
}

export function useSwapList(page = 1, size = 20) {
  return useQuery({
    queryKey: swapKeys.list(page, size),
    queryFn: () => swapsApi.list(page, size),
    staleTime: 15_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateSwapQuotation() {
  return useMutation({
    mutationFn: ({
      fromCurrency,
      toCurrency,
      amount,
    }: {
      fromCurrency: string;
      toCurrency: string;
      amount: number | string;
    }) => swapsApi.createQuotation(fromCurrency, toCurrency, amount),
  });
}

export function useExecuteSwap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quotationId: string) =>
      swapsApi.executeQuotation(quotationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: swapKeys.all });
      qc.invalidateQueries({ queryKey: ledgerKeys.all });
    },
  });
}

export function useCreateOfframp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOfframpDto) => offrampApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: swapKeys.all });
    },
  });
}
