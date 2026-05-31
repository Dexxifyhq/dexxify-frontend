import { get, post, put, del } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types/common";
import type {
  Wallet,
  WalletDetails,
  WalletAddress,
  WalletBalance,
  WalletTransaction,
  CreateWalletDto,
  UpdateWalletBankDetailsDto,
  UpdateWalletAutoSettlementDto,
  WalletListFilters,
  WalletTransactionFilters,
  WithdrawalAddress,
  AddWithdrawalAddressDto,
  InitiateStableCoinWithdrawalDto,
  InitiateFiatWithdrawalDto,
  BreetWithdrawalFilters,
  WithdrawalResult,
  MockTradeDto,
} from "@/lib/types/wallet";

export const walletsApi = {
  // POST /wallets/balance — retrieve current balance for a user
  getBalance: () => post<WalletBalance>("/wallets/balance"),

  // POST /wallets — create a new wallet
  create: (payload: CreateWalletDto) => post<Wallet>("/wallets", payload),

  // GET /wallets — list wallets
  getAll: (filters: WalletListFilters = {}) =>
    get<PaginatedResponse<Wallet>>("/wallets", {
      ...(filters.wallet_id ? { wallet_id: filters.wallet_id } : {}),
      ...(filters.asset_id ? { asset_id: filters.asset_id } : {}),
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    }),

  // GET /wallets/{wallet_id}
  getById: (walletId: string) => get<Wallet>(`/wallets/${walletId}`),

  // GET /wallets/{wallet_id}/details
  getDetails: (walletId: string) =>
    get<WalletDetails>(`/wallets/${walletId}/details`),

  // GET /wallets/details/all
  getAllDetails: () => get<WalletDetails[]>("/wallets/details/all"),

  // GET /wallets/{wallet_id}/address — deposit address
  getAddress: (walletId: string) =>
    get<WalletAddress>(`/wallets/${walletId}/address`),

  // PUT /wallets/{wallet_id}/bank
  updateBank: (walletId: string, payload: UpdateWalletBankDetailsDto) =>
    put<Wallet>(`/wallets/${walletId}/bank`, payload),

  // PUT /wallets/{wallet_id}/auto_settlement
  updateAutoSettlement: (
    walletId: string,
    payload: UpdateWalletAutoSettlementDto,
  ) => put<Wallet>(`/wallets/${walletId}/auto_settlement`, payload),

  // GET /wallets/transactions/all
  getAllTransactions: (filters: WalletTransactionFilters = {}) =>
    get<PaginatedResponse<WalletTransaction>>("/wallets/transactions/all", {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    }),

  // GET /wallets/{wallet_id}/transactions — transactions for a single wallet
  getWalletTransactions: (
    walletId: string,
    filters: WalletTransactionFilters = {},
  ) =>
    get<PaginatedResponse<WalletTransaction>>(
      `/wallets/${walletId}/transactions`,
      {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
      },
    ),

  // ── Withdrawal addresses ───────────────────────────────────────────────────

  // POST /wallets/withdrawal-addresses — save a reusable withdrawal address
  addWithdrawalAddress: (payload: AddWithdrawalAddressDto) =>
    post<WithdrawalAddress>("/wallets/withdrawal-addresses", payload),

  // GET /wallets/withdrawal-addresses/saved — user-saved addresses
  getSavedWithdrawalAddresses: () =>
    get<WithdrawalAddress[]>("/wallets/withdrawal-addresses/saved"),

  // GET /wallets/withdrawal-addresses/breet — Breet-whitelisted addresses
  getBreetWithdrawalAddresses: () =>
    get<WithdrawalAddress[]>("/wallets/withdrawal-addresses/breet"),

  // DELETE /wallets/withdrawal-addresses/{id}
  deleteWithdrawalAddress: (withdrawalAddressId: string) =>
    del<WithdrawalResult>(
      `/wallets/withdrawal-addresses/${withdrawalAddressId}`,
    ),

  // ── Withdrawals ─────────────────────────────────────────────────────────────

  // POST /wallets/withdrawals/stable-coins — on-chain stablecoin withdrawal
  withdrawStableCoin: (payload: InitiateStableCoinWithdrawalDto) =>
    post<WithdrawalResult>("/wallets/withdrawals/stable-coins", payload),

  // POST /wallets/withdrawals/local-currencies — fiat payout to a bank
  withdrawFiat: (payload: InitiateFiatWithdrawalDto) =>
    post<WithdrawalResult>("/wallets/withdrawals/local-currencies", payload),

  // GET /wallets/withdrawals/breet — Breet withdrawal history.
  // NOTE: the spec mislabels page/size as path params; they are query params.
  getBreetWithdrawals: (filters: BreetWithdrawalFilters = {}) =>
    get<PaginatedResponse<WithdrawalResult>>("/wallets/withdrawals/breet", {
      page: filters.page ?? 1,
      size: filters.size ?? 20,
    }),

  // ── Sandbox testing ──────────────────────────────────────────────────────────

  // POST /wallets/mock-trade — simulate a deposit/trade (sandbox only)
  mockTrade: (payload: MockTradeDto) =>
    post<WithdrawalResult>("/wallets/mock-trade", payload),
};
