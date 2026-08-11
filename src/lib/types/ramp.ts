import type { TxStatus } from "./common";

export type RampCryptoAsset = "BTC" | "USDT" | "ETH" | "USDC";

// (Former Ramp)
// ── Off-Ramp ───────────────────────────────────────────────────────────────

export interface OfframpTransaction {
  id: string;
  reference: string;
  wallet_id: string;
  crypto_asset: RampCryptoAsset;
  crypto_amount: number;
  fiat_amount: number;
  fiat_currency: string;
  rate: number;
  bank_id: number;
  account_number: number;
  account_name: string;
  status: TxStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface CreateOfframpDto {
  wallet_id: string;
  crypto_asset: RampCryptoAsset;
  crypto_amount: number;
  bank_id: number;
  account_number: number;
  account_name: string;
  metadata?: Record<string, unknown>;
}

// ── On-Ramp ────────────────────────────────────────────────────────────────

export interface OnrampTransaction {
  id: string;
  reference: string;
  wallet_id: string;
  crypto_asset: RampCryptoAsset;
  crypto_amount: number;
  ngn_amount: number;
  rate: number;
  payment_reference?: string;
  status: TxStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface CreateOnrampDto {
  wallet_id: string;
  crypto_asset: RampCryptoAsset;
  ngn_amount: number;
  payment_reference?: string;
  metadata?: Record<string, unknown>;
}
