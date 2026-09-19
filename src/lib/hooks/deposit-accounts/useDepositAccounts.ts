import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { depositAccountsApi } from "@/lib/api/deposit-accounts";
import type {
  AddWithdrawalAddressDto,
  CreateDepositAccountDto,
  IssueDepositIdentityDto,
  InitiateFiatWithdrawalDto,
  InitiateStableCoinWithdrawalDto,
  WalletListFilters,
  WalletTransactionFilters,
} from "@/lib/types/deposit-accounts";

export const walletKeys = {
  all: ["wallets"] as const,
  balance: () => [...walletKeys.all, "balance"] as const,
  list: (filters: WalletListFilters) =>
    [...walletKeys.all, "list", filters] as const,
  detail: (walletId: string) =>
    [...walletKeys.all, "detail", walletId] as const,
  details: (walletId: string) =>
    [...walletKeys.all, "details", walletId] as const,
  allDetails: () => [...walletKeys.all, "details", "all"] as const,
  address: (walletId: string) =>
    [...walletKeys.all, "address", walletId] as const,
  transactions: (filters: WalletTransactionFilters) =>
    [...walletKeys.all, "transactions", filters] as const,
  walletTransactions: (walletId: string, filters: WalletTransactionFilters) =>
    [...walletKeys.all, "transactions", walletId, filters] as const,
  savedAddresses: () =>
    [...walletKeys.all, "withdrawal-addresses", "saved"] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

export function useWallets(filters: WalletListFilters = {}) {
  return useQuery({
    queryKey: walletKeys.list(filters),
    queryFn: () => depositAccountsApi.getAll(filters),
    staleTime: 30_000,
  });
}

export function useWallet(walletId: string) {
  return useQuery({
    queryKey: walletKeys.detail(walletId),
    queryFn: () => depositAccountsApi.getById(walletId),
    enabled: !!walletId,
    staleTime: 30_000,
  });
}

export function useWalletDetails(walletId: string) {
  return useQuery({
    queryKey: walletKeys.details(walletId),
    queryFn: () => depositAccountsApi.getDetails(walletId),
    enabled: !!walletId,
    staleTime: 30_000,
  });
}

export function useAllWalletDetails() {
  return useQuery({
    queryKey: walletKeys.allDetails(),
    queryFn: depositAccountsApi.getAllDetails,
    staleTime: 30_000,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateDepositAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepositAccountDto) =>
      depositAccountsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useIssueIdentity() {
  return useMutation({
    mutationFn: ({
      walletId,
      dto,
    }: {
      walletId: string;
      dto: IssueDepositIdentityDto;
    }) => depositAccountsApi.issueIdentity(walletId, dto),
  });
}

// ── Withdrawal addresses ──────────────────────────────────────────────────────

export function useSavedWithdrawalAddresses() {
  return useQuery({
    queryKey: walletKeys.savedAddresses(),
    queryFn: depositAccountsApi.getSavedWithdrawalAddresses,
    staleTime: 60_000,
  });
}

export function useAddWithdrawalAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddWithdrawalAddressDto) =>
      depositAccountsApi.addWithdrawalAddress(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.savedAddresses() });
    },
  });
}

export function useDeleteWithdrawalAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (withdrawalAddressId: string) =>
      depositAccountsApi.deleteWithdrawalAddress(withdrawalAddressId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.savedAddresses() });
    },
  });
}

// ── Withdrawals ────────────────────────────────────────────────────────────────

export function useWithdrawStableCoin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InitiateStableCoinWithdrawalDto) =>
      depositAccountsApi.withdrawStableCoin(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.balance() });
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useWithdrawFiat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InitiateFiatWithdrawalDto) =>
      depositAccountsApi.withdrawFiat(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.balance() });
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}
