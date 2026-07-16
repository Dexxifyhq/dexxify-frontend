// ── Banks ──────────────────────────────────────────────────────────────────

export interface Bank {
  name: string;
  slug: string;
  code: string;
  country: string;
}

export interface SavedBank {
  id: string;
  provider_recipient_id: string;
  developer_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code: string;
  currency: string;
  type: string | null;
  label: string | null;
  is_trusted: boolean;
  primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankVerification {
  valid: boolean;
  type: string;
  resolved: {
    accountName: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
  };
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
  bankCode: string;
  label?: string;
  isDefault: boolean;
}

export interface VerifyBankAccountDto {
  accountNumber: string;
  bankCode: string;
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
