import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletsApi } from "@/lib/api/wallet";
import type {
  AddWithdrawalAddressDto,
  CreateWalletDto,
  IssueDepositIdentityDto,
  InitiateFiatWithdrawalDto,
  InitiateStableCoinWithdrawalDto,
  MockTradeDto,
  UpdateWalletAutoSettlementDto,
  UpdateWalletBankDetailsDto,
  WalletListFilters,
  WalletTransactionFilters,
} from "@/lib/types/wallet";

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
    queryFn: () => walletsApi.getAll(filters),
    staleTime: 30_000,
  });
}

export function useWallet(walletId: string) {
  return useQuery({
    queryKey: walletKeys.detail(walletId),
    queryFn: () => walletsApi.getById(walletId),
    enabled: !!walletId,
    staleTime: 30_000,
  });
}

export function useWalletDetails(walletId: string) {
  return useQuery({
    queryKey: walletKeys.details(walletId),
    queryFn: () => walletsApi.getDetails(walletId),
    enabled: !!walletId,
    staleTime: 30_000,
  });
}

export function useAllWalletDetails() {
  return useQuery({
    queryKey: walletKeys.allDetails(),
    queryFn: walletsApi.getAllDetails,
    staleTime: 30_000,
  });
}

export function useWalletAddress(walletId: string) {
  return useQuery({
    queryKey: walletKeys.address(walletId),
    queryFn: () => walletsApi.getAddress(walletId),
    enabled: !!walletId,
    staleTime: 5 * 60 * 1000, // addresses are stable
  });
}

export function useWalletTransactions(filters: WalletTransactionFilters = {}) {
  return useQuery({
    queryKey: walletKeys.transactions(filters),
    queryFn: () => walletsApi.getAllTransactions(filters),
    staleTime: 15_000,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWalletDto) => walletsApi.create(payload),
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
    }) => walletsApi.issueIdentity(walletId, dto),
  });
}

export function useUpdateWalletBank(walletId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWalletBankDetailsDto) =>
      walletsApi.updateBank(walletId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.detail(walletId) });
      qc.invalidateQueries({ queryKey: walletKeys.details(walletId) });
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useUpdateWalletAutoSettlement(walletId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWalletAutoSettlementDto) =>
      walletsApi.updateAutoSettlement(walletId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.detail(walletId) });
      qc.invalidateQueries({ queryKey: walletKeys.details(walletId) });
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

// ── Per-wallet transactions ──────────────────────────────────────────────────

export function useWalletTransactionsById(
  walletId: string,
  filters: WalletTransactionFilters = {},
) {
  return useQuery({
    queryKey: walletKeys.walletTransactions(walletId, filters),
    queryFn: () => walletsApi.getWalletTransactions(walletId, filters),
    enabled: !!walletId,
    staleTime: 15_000,
  });
}

// ── Withdrawal addresses ──────────────────────────────────────────────────────

export function useSavedWithdrawalAddresses() {
  return useQuery({
    queryKey: walletKeys.savedAddresses(),
    queryFn: walletsApi.getSavedWithdrawalAddresses,
    staleTime: 60_000,
  });
}

export function useAddWithdrawalAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddWithdrawalAddressDto) =>
      walletsApi.addWithdrawalAddress(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.savedAddresses() });
    },
  });
}

export function useDeleteWithdrawalAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (withdrawalAddressId: string) =>
      walletsApi.deleteWithdrawalAddress(withdrawalAddressId),
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
      walletsApi.withdrawStableCoin(payload),
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
      walletsApi.withdrawFiat(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.balance() });
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

// ── Sandbox testing ──────────────────────────────────────────────────────────

export function useMockTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MockTradeDto) => walletsApi.mockTrade(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.balance() });
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}
