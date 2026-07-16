import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { miscApi } from "@/lib/api/misc";
import type {
  AddBankDto,
  VerifyBankAccountDto,
  GetRateQueryDto,
  RateCalculatorDto,
} from "@/lib/types/misc";

// ── Query key factories ────────────────────────────────────────────────────

export const bankKeys = {
  all: ["banks"] as const,
  list: () => [...bankKeys.all, "list"] as const,
  saved: () => [...bankKeys.all, "saved"] as const,
  savedByAccount: (accountNumber: string) =>
    [...bankKeys.saved(), accountNumber] as const,
};

export const priceKeys = {
  all: ["prices"] as const,
};

// ── Bank queries ───────────────────────────────────────────────────────────

export function useBanks() {
  return useQuery({
    queryKey: bankKeys.list(),
    queryFn: miscApi.getBanks,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useSavedBanks() {
  return useQuery({
    queryKey: bankKeys.saved(),
    queryFn: miscApi.getSavedBanks,
    staleTime: 30_000,
  });
}

// ── Bank mutations ─────────────────────────────────────────────────────────

export function useVerifyBank() {
  return useMutation({
    mutationFn: (payload: VerifyBankAccountDto) => miscApi.verifyBank(payload),
  });
}

export function useSaveBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddBankDto) => miscApi.saveBank(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bankKeys.saved() });
    },
  });
}

export function useDeleteBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bankId: string) => miscApi.deleteBank(bankId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bankKeys.all });
    },
  });
}

// ── Pricing ────────────────────────────────────────────────────────────────

export function useCryptoPrice() {
  return useMutation({
    mutationFn: (payload: GetRateQueryDto) => miscApi.getCryptoPrice(payload),
  });
}

export function useRateCalculator() {
  return useMutation({
    mutationFn: (payload: RateCalculatorDto) => miscApi.calculateRate(payload),
  });
}
