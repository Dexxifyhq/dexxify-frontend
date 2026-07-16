import { get, post } from "@/lib/api-client";

// ── Enums ────────────────────────────────────────────────────────────────────

export type WalletAsset =
  | "BTC"
  | "TRX"
  | "BNB"
  | "TON"
  | "USDT"
  | "ETH"
  | "USDC"
  | "SOL";

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateOfframpDto {
  wallet_id: string;
  crypto_asset: WalletAsset;
  crypto_amount: number;
  recipient_id: string;
  metadata?: Record<string, unknown>;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const offrampApi = {
  /** POST /offramp */
  create: (dto: CreateOfframpDto) =>
    post<{ id: string; status: string; [key: string]: unknown }>(
      "/offramp",
      dto,
    ),

  /** GET /offramp/:txId */
  findOne: (txId: string) =>
    get<{ id: string; status: string; [key: string]: unknown }>(
      `/offramp/${txId}`,
    ),
};
