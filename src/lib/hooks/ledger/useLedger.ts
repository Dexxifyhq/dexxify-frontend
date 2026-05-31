import { useQuery } from "@tanstack/react-query";
import { ledgerApi } from "@/lib/api/ledger";
import type {
  LedgerFilters,
  SettlementReportFilters,
} from "@/lib/types/ledger";

export const ledgerKeys = {
  all: ["ledger"] as const,
  transactions: (filters: LedgerFilters) =>
    [...ledgerKeys.all, "transactions", filters] as const,
  transaction: (txId: string) =>
    [...ledgerKeys.all, "transaction", txId] as const,
  balance: () => [...ledgerKeys.all, "balance"] as const,
  settlementReport: (filters: SettlementReportFilters) =>
    [...ledgerKeys.all, "settlement-report", filters] as const,
};

export function useLedgerTransactions(filters: LedgerFilters = {}) {
  return useQuery({
    queryKey: ledgerKeys.transactions(filters),
    queryFn: () => ledgerApi.getTransactions(filters),
    staleTime: 15_000,
  });
}

export function useLedgerTransaction(txId: string) {
  return useQuery({
    queryKey: ledgerKeys.transaction(txId),
    queryFn: () => ledgerApi.getTransaction(txId),
    enabled: !!txId,
    staleTime: 30_000,
  });
}

export function useLedgerBalance() {
  return useQuery({
    queryKey: ledgerKeys.balance(),
    queryFn: ledgerApi.getBalance,
    staleTime: 20_000,
    refetchInterval: 60_000,
  });
}

export function useSettlementReport(filters: SettlementReportFilters = {}) {
  return useQuery({
    queryKey: ledgerKeys.settlementReport(filters),
    queryFn: () => ledgerApi.getSettlementReport(filters),
    staleTime: 60_000,
  });
}
