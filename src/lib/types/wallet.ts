import type { CryptoCurrency, TxStatus, PaginatedResponse } from "./common";

// ── Wallet ─────────────────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  label: string;
  asset_id: string;
  asset_symbol?: CryptoCurrency | string;
  address?: string;
  balance?: number;
  available_balance?: number;
  pending_balance?: number;
  auto_settlement?: boolean;
  bank_id?: string;
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  created_at: string;
  updated_at?: string;
}

// ── Wallet details ─────────────────────────────────────────────────────────

export interface WalletDetails extends Wallet {
  network?: string;
  qr_code?: string;
  total_received?: number;
  total_sent?: number;
  narration?: string;
}

// ── Deposit address ────────────────────────────────────────────────────────

export interface WalletAddress {
  wallet_id: string;
  address: string;
  network: string;
  asset_symbol: string;
  qr_code?: string;
  memo?: string;
}

// ── Wallet balance summary ─────────────────────────────────────────────────

export interface WalletBalance {
  total_balance: number;
  available_balance: number;
  pending_balance: number;
  currency: string;
  wallets?: Wallet[];
}

// ── Wallet transaction ─────────────────────────────────────────────────────

export type WalletTxType =
  | "deposit"
  | "withdrawal"
  | "swap"
  | "payout"
  | "fee"
  | "credit"
  | "debit";

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  reference: string;
  tx_hash?: string;
  type: WalletTxType;
  amount: number;
  currency: string;
  status: TxStatus;
  description?: string;
  created_at: string;
}

export type WalletTransactionsResponse = PaginatedResponse<WalletTransaction>;

// ── DTOs ───────────────────────────────────────────────────────────────────

export interface CreateWalletDto {
  label: string;
  asset_id: string;
  bank_id?: string;
  account_number?: string;
  auto_settlement?: boolean;
}

export interface UpdateWalletBankDetailsDto {
  bank_id: string;
  account_number: string;
  narration?: string;
  auto_settlement?: boolean;
}

export interface UpdateWalletAutoSettlementDto {
  auto_settlement: boolean;
}

// ── Filters ────────────────────────────────────────────────────────────────

export interface WalletListFilters {
  wallet_id?: string;
  asset_id?: string;
  page?: number;
  limit?: number;
}

export interface WalletTransactionFilters {
  page?: number;
  limit?: number;
}

// ── Withdrawal addresses ─────────────────────────────────────────────────────

export interface WithdrawalAddress {
  id: string;
  address: string;
  network: string;
  token: string;
  label: string;
  created_at?: string;
  // Response shape isn't declared in the spec — keep it forgiving.
  [key: string]: unknown;
}

export interface AddWithdrawalAddressDto {
  address: string;
  network: string;
  token: string;
  label: string;
}

// ── Withdrawals ──────────────────────────────────────────────────────────────

export interface InitiateStableCoinWithdrawalDto {
  address: string;
  amount: number;
  network: string;
  token: string;
  externalId: string;
  pin?: string;
}

export interface InitiateFiatWithdrawalDto {
  bank_id: string;
  amount: number;
  narration?: string;
  pin?: string;
}

export interface BreetWithdrawalFilters {
  page?: number;
  size?: number;
}

/** Withdrawal / mock-trade results aren't typed in the spec — kept permissive. */
export interface WithdrawalResult {
  id?: string;
  reference?: string;
  status?: string;
  tx_hash?: string;
  [key: string]: unknown;
}

// ── Mock trade (sandbox testing only) ────────────────────────────────────────

export interface MockTradeDto {
  walletAddress: string;
  asset: string;
  amountInUSD: number;
  cryptoReceived: number;
  reference?: string;
  txHash?: string;
  sourceAddress?: string;
  confirmations?: number;
}
