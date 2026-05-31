import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { miscApi } from "@/lib/api/misc";
import type {
  AddBankDto,
  VerifyBankAccountDto,
  GetRateQueryDto,
  RateCalculatorDto,
  ConvertUsdToFiatDto,
  ConvertFiatToUsdDto,
} from "@/lib/types/misc";

// ── Query key factories ────────────────────────────────────────────────────

export const bankKeys = {
  all: ["banks"] as const,
  list: () => [...bankKeys.all, "list"] as const,
  breet: () => [...bankKeys.all, "breet"] as const,
  saved: () => [...bankKeys.all, "saved"] as const,
  savedByAccount: (accountNumber: string) =>
    [...bankKeys.saved(), accountNumber] as const,
  detail: (bankId: string) => [...bankKeys.all, "detail", bankId] as const,
};

export const assetKeys = {
  all: ["assets"] as const,
  deposit: () => [...assetKeys.all, "deposit"] as const,
  withdrawal: () => [...assetKeys.all, "withdrawal"] as const,
};

export const priceKeys = {
  all: ["prices"] as const,
  rate: (from: string, to: string) =>
    [...priceKeys.all, "rate", from, to] as const,
};

// ── Bank queries ───────────────────────────────────────────────────────────

export function useBanks() {
  return useQuery({
    queryKey: bankKeys.list(),
    queryFn: miscApi.getBanks,
    staleTime: 24 * 60 * 60 * 1000, // backend caches 24h
  });
}

export function useBreetBanks() {
  return useQuery({
    queryKey: bankKeys.breet(),
    queryFn: miscApi.getBreetBanks,
    staleTime: 60 * 60 * 1000,
  });
}

export function useSavedBanks() {
  return useQuery({
    queryKey: bankKeys.saved(),
    queryFn: miscApi.getSavedBanks,
    staleTime: 30_000,
  });
}

export function useSavedBank(accountNumber: string) {
  return useQuery({
    queryKey: bankKeys.savedByAccount(accountNumber),
    queryFn: () => miscApi.getSavedBankByAccount(accountNumber),
    enabled: !!accountNumber,
    staleTime: 30_000,
  });
}

export function useBank(bankId: string) {
  return useQuery({
    queryKey: bankKeys.detail(bankId),
    queryFn: () => miscApi.getBankById(bankId),
    enabled: !!bankId,
    staleTime: 60 * 60 * 1000,
  });
}

// ── Bank mutations ─────────────────────────────────────────────────────────

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

export function useVerifyBank() {
  return useMutation({
    mutationFn: (payload: VerifyBankAccountDto) => miscApi.verifyBank(payload),
  });
}

// ── Asset queries ──────────────────────────────────────────────────────────

export function useDepositAssets() {
  return useQuery({
    queryKey: assetKeys.deposit(),
    queryFn: miscApi.getDepositAssets,
    staleTime: 60 * 60 * 1000,
  });
}

export function useWithdrawalAssets() {
  return useQuery({
    queryKey: assetKeys.withdrawal(),
    queryFn: miscApi.getWithdrawalAssets,
    staleTime: 60 * 60 * 1000,
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

// ── Conversion ─────────────────────────────────────────────────────────────

export function useConvertUsdToFiat() {
  return useMutation({
    mutationFn: (payload: ConvertUsdToFiatDto) =>
      miscApi.convertUsdToFiat(payload),
  });
}

export function useConvertFiatToUsd() {
  return useMutation({
    mutationFn: (payload: ConvertFiatToUsdDto) =>
      miscApi.convertFiatToUsd(payload),
  });
}
