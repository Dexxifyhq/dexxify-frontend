import { get, post, del } from "@/lib/api-client";
import type { PaginatedResponse } from "@/lib/types/common";
import type {
  Wallet,
  WalletDetails,
  CreateDepositAccountDto,
  IssueDepositIdentityDto,
  WalletListFilters,
  WithdrawalAddress,
  AddWithdrawalAddressDto,
  InitiateStableCoinWithdrawalDto,
  InitiateFiatWithdrawalDto,
  WithdrawalResult,
} from "@/lib/types/deposit-accounts";

export const depositAccountsApi = {
  // POST /deposit-accounts — create a new deposit account
  create: (payload: CreateDepositAccountDto) =>
    post<Wallet>("/deposit-accounts", payload),

  // POST /deposit-accounts/:deposit_account_id/identities — issue a crypto address or NGN virtual account
  issueIdentity: (walletId: string, payload: IssueDepositIdentityDto) =>
    post<unknown>(`/deposit-accounts/${walletId}/identities`, payload),

  // GET /deposit-accounts  — list deposit-accounts
  getAll: (filters: WalletListFilters = {}) =>
    get<PaginatedResponse<Wallet>>("/deposit-accounts", {
      ...(filters.deposit_account_id
        ? { deposit_account_id: filters.deposit_account_id }
        : {}),
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    }),

  // GET /deposit-accounts /{deposit_account_id}
  getById: (walletId: string) => get<Wallet>(`/deposit-accounts/${walletId}`),

  // GET /deposit-accounts /{deposit_account_id}/details
  getDetails: (walletId: string) =>
    get<WalletDetails>(`/deposit-accounts/${walletId}/details`),

  // GET /deposit-accounts /details/all
  getAllDetails: () => get<WalletDetails[]>("/deposit-accounts/details/all"),

  // ── Withdrawal addresses ───────────────────────────────────────────────────

  // POST /deposit-accounts/withdrawal-addresses — save a reusable withdrawal address
  addWithdrawalAddress: (payload: AddWithdrawalAddressDto) =>
    post<WithdrawalAddress>("/deposit-accounts/withdrawal-addresses", payload),

  // GET /deposit-accounts/withdrawal-addresses/saved — user-saved addresses
  getSavedWithdrawalAddresses: () =>
    get<WithdrawalAddress[]>("/deposit-accounts/withdrawal-addresses/saved"),

  // DELETE /deposit-accounts/withdrawal-addresses/{id}
  deleteWithdrawalAddress: (withdrawalAddressId: string) =>
    del<WithdrawalResult>(
      `/deposit-accounts/withdrawal-addresses/${withdrawalAddressId}`,
    ),

  // ── Withdrawals ─────────────────────────────────────────────────────────────

  // POST /deposit-accounts/withdrawals/stable-coins — on-chain stablecoin withdrawal
  withdrawStableCoin: (payload: InitiateStableCoinWithdrawalDto) =>
    post<WithdrawalResult>(
      "/deposit-accounts/withdrawals/stable-coins",
      payload,
    ),

  // POST /deposit-accounts/withdrawals/local-currencies — fiat payout to a bank
  withdrawFiat: (payload: InitiateFiatWithdrawalDto) =>
    post<WithdrawalResult>(
      "/deposit-accounts/withdrawals/local-currencies",
      payload,
    ),
};
