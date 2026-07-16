/**
 * Maps the CC chain key (response key) to our WalletNetwork enum value.
 * These values must match the WalletNetwork enum in the backend exactly.
 */
const CC_CHAIN_TO_NETWORK: Record<string, string> = {
  ethereum: "Ethereum",
  solana: "Solana",
  bsc: "Binance_Smart_Chain",
  tron: "Tron",
  bitcoin: "Bitcoin",
  base: "Base",
  arbitrum: "Arbitrum",
};

/** Human-readable label for each chain key */
const CHAIN_DISPLAY: Record<string, string> = {
  ethereum: "Ethereum",
  solana: "Solana",
  bsc: "BSC",
  tron: "Tron",
  bitcoin: "Bitcoin",
  base: "Base",
  arbitrum: "Arbitrum",
};

export interface FlatAsset {
  key: string;
  symbol: string;
  name: string;
  /** WalletNetwork enum value — sent to deposit-address endpoint */
  network: string;
  /** CC chain key (lowercase) — sent to estimate endpoint */
  chainKey: string;
  /** Human label shown in the picker */
  networkDisplay: string;
}

/**
 * Normalises the nested assets response into a flat array the picker can use.
 *
 * Input shape:
 * { ethereum: [ { asset, networkId, metadata: { name, symbol } } ], solana: [...], ... }
 */
export function flattenAssets(raw: Record<string, any[]>): FlatAsset[] {
  if (!raw || typeof raw !== "object") return [];
  return Object.entries(raw).flatMap(([chainKey, items]) =>
    (items ?? []).map((item: any) => ({
      key: `${item.asset}-${chainKey}`,
      symbol: item.asset as string,
      name: item.metadata?.name ?? item.asset,
      network: CC_CHAIN_TO_NETWORK[chainKey] ?? chainKey,
      chainKey,
      networkDisplay: CHAIN_DISPLAY[chainKey] ?? chainKey,
    })),
  );
}
