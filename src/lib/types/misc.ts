// ── Banks ──────────────────────────────────────────────────────────────────

export interface Bank {
  id: string;
  name: string;
  code?: string;
  slug?: string;
  country?: string;
  active?: boolean;
}

export interface SavedBank {
  id: string;
  bank_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  narration?: string;
  created_at: string;
}

export interface BankVerification {
  account_number: string;
  account_name: string;
  bank_id: string;
  bank_name?: string;
}

// ── Crypto assets ──────────────────────────────────────────────────────────

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  network: string;
  decimals?: number;
  icon?: string;
  contract_address?: string | null;
  is_testnet?: boolean;
  is_active?: boolean;
}

// ── Pricing ────────────────────────────────────────────────────────────────

export interface CryptoPrice {
  from: string;
  to: string;
  rate: number;
  timestamp?: string;
}

export interface RateCalculation {
  asset_id: string;
  amount_in_usd: number;
  amount_in_crypto: number;
  amount_in_local: number;
  currency: string;
  rate: number;
}

// ── Conversion responses ───────────────────────────────────────────────────

export interface ConversionResult {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

// ── DTOs ───────────────────────────────────────────────────────────────────

export interface AddBankDto {
  accountNumber: string;
  bankId: string;
  narration?: string;
}

export interface VerifyBankAccountDto {
  accountNumber: string;
  bankId: string;
}

export interface GetRateQueryDto {
  from: string;
  to: string;
}

export interface RateCalculatorDto {
  assetId: string;
  amountInUSD: number;
  currency: string;
}

export interface ConvertUsdToFiatDto {
  amount: number;
  pin: string;
  bankId: string;
}

export interface ConvertFiatToUsdDto {
  localAmount: number;
  pin: string;
  withdrawalAddressId: string;
}
