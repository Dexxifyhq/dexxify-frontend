import type { CryptoCurrency, TxStatus, PaginatedResponse } from "./common";

// (Former Integration)
// ── Wallet ─────────────────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  label: string;
  asset_id: string;
  asset_symbol?: CryptoCurrency | string;
  address?: string;
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

// ── Wallet transaction ─────────────────────────────────────────────────────

export type WalletTxType =
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "onramp"
  | "offramp"
  | "payout"
  | "fee"
  | "swap"
  | "refund";

export type LedgerEntryStatus =
  | "initiated"
  | "pending"
  | "completed"
  | "processing"
  | "rejected"
  | "reversed";

export interface WalletTransaction {
  id: string;
  developer_id: string;
  tx_type: WalletTxType;
  wallet_address: string | null;
  reference_type: string;
  reference_id: string;
  debit_ngn: number;
  credit_ngn: number;
  debit_usd: number;
  credit_usd: number;
  asset: string | null;
  status: LedgerEntryStatus;
  amount_usd: number | null;
  amount_crypto: number | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type WalletTransactionsResponse = WalletTransaction[];

// ── DTOs ───────────────────────────────────────────────────────────────────

export interface CreateWalletDto {
  customer_id?: string;
}

export type DepositIdentityType =
  | "static_deposit_address"
  | "ngn_virtual_account";

export type DepositIdentityChain =
  | "bitcoin"
  | "ethereum"
  | "solana"
  | "bsc"
  | "tron"
  | "base"
  | "arbitrum";

export interface IssueDepositIdentityDto {
  type: DepositIdentityType;
  chain?: DepositIdentityChain;
  bvn?: string;
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

export type WithdrawalNetwork = "ethereum" | "tron" | "solana" | "bsc" | "base";
export type WithdrawalToken = "USDT" | "USDC";

export interface WithdrawalAddress {
  id: string;
  developer_id: string;
  address: string;
  network: WithdrawalNetwork;
  token: WithdrawalToken;
  label: string;
  primary: boolean;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddWithdrawalAddressDto {
  address: string;
  network: WithdrawalNetwork;
  token: WithdrawalToken;
  label: string;
  isDefault: boolean;
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
