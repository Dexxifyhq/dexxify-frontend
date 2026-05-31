// ── API keys ───────────────────────────────────────────────────────────────

export type ApiKeyEnvironment = "sandbox" | "live";

export interface ApiKey {
  id: string;
  label?: string;
  environment: ApiKeyEnvironment;
  key?: string; // returned in plaintext only on create
  prefix?: string; // safe to display in lists
  last_four?: string;
  ip_whitelist?: string[];
  last_used_at?: string;
  created_at: string;
  updated_at?: string;
  revoked_at?: string;
}

export interface CreateApiKeyDto {
  label?: string;
  environment: ApiKeyEnvironment;
}

export interface UpdateApiKeyDto {
  label?: string;
  ip_whitelist?: string[];
}

// ── Dashboard meta ─────────────────────────────────────────────────────────

export interface DashboardOverview {
  total_wallets: number;
  total_payouts: number;
  total_payout_volume: number;
  total_onramp_volume: number;
  total_offramp_volume: number;
  currency: string;
  // shape is a guess — adjust once backend response is available
  [key: string]: unknown;
}

export interface DashboardUsageDay {
  date: string;
  requests: number;
  errors?: number;
}

export interface DashboardUsage {
  total_requests: number;
  total_errors?: number;
  rate_limit?: number;
  days: DashboardUsageDay[];
}

export interface DashboardUsageFilters {
  days?: number;
}
