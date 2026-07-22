import { get, post, put, del } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types/common";
import type {
  Wallet,
  WalletDetails,
  WalletAddress,
  WalletTransaction,
  CreateWalletDto,
  IssueDepositIdentityDto,
  UpdateWalletBankDetailsDto,
  UpdateWalletAutoSettlementDto,
  WalletListFilters,
  WalletTransactionFilters,
  WithdrawalAddress,
  AddWithdrawalAddressDto,
  InitiateStableCoinWithdrawalDto,
  InitiateFiatWithdrawalDto,
  WithdrawalResult,
  MockTradeDto,
} from "@/lib/types/wallet";

export const walletsApi = {
  // POST /wallets — create a new wallet
  create: (payload: CreateWalletDto) => post<any>("/wallets", payload),

  // POST /wallets/:wallet_id/identities — issue a crypto address or NGN virtual account
  issueIdentity: (walletId: string, payload: IssueDepositIdentityDto) =>
    post<any>(`/wallets/${walletId}/identities`, payload),

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
    get<WalletTransaction[]>("/wallets/transactions/all", {
      page: filters.page ?? 1,
      limit: filters.limit ?? 100,
    }),

  // GET /wallets/{wallet_id}/transactions — transactions for a single wallet
  getWalletTransactions: (
    walletId: string,
    filters: WalletTransactionFilters = {},
  ) =>
    get<WalletTransaction[]>(`/wallets/${walletId}/transactions`, {
      page: filters.page ?? 1,
      limit: filters.limit ?? 100,
    }),

  // ── Withdrawal addresses ───────────────────────────────────────────────────

  // POST /wallets/withdrawal-addresses — save a reusable withdrawal address
  addWithdrawalAddress: (payload: AddWithdrawalAddressDto) =>
    post<WithdrawalAddress>("/wallets/withdrawal-addresses", payload),

  // GET /wallets/withdrawal-addresses/saved — user-saved addresses
  getSavedWithdrawalAddresses: () =>
    get<WithdrawalAddress[]>("/wallets/withdrawal-addresses/saved"),

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

  // ── Sandbox testing ──────────────────────────────────────────────────────────

  // POST /wallets/mock-trade — simulate a deposit/trade (sandbox only)
  mockTrade: (payload: MockTradeDto) =>
    post<WithdrawalResult>("/wallets/mock-trade", payload),
};
