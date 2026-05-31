import type { DateRange, FiatCurrency } from "./common";

// ── Stats ──────────────────────────────────────────────────────────────────

export interface StatChange {
  value: number;
  percent: number;
  direction: "up" | "down" | "flat";
}

/**
 * Raw shape of GET /dashboard/overview (after envelope unwrap). The backend
 * returns nested objects with counts + NGN volumes; all kept optional so a
 * partial/changed payload degrades to zeros instead of throwing.
 */
export interface DashboardOverviewResponse {
  wallets?: { total?: number };
  payouts?: { total?: number; volume_ngn?: number };
  offramps?: { total?: number; volume_ngn?: number };
  kyc_verifications?: { total?: number };
  total_volume_ngn?: number;
}

/**
 * UI-facing stats mapped from DashboardOverviewResponse. The four cards reflect
 * the real crypto-infra metrics this backend exposes (volume / wallets /
 * payouts / KYC verifications) — not generic payments-SaaS metrics.
 */
export interface DashboardStats {
  total_volume: { value: number; change: StatChange; currency: string };
  wallets: { value: number; change: StatChange };
  payouts: { value: number; change: StatChange };
  kyc_verifications: { value: number; change: StatChange };
}

// ── Revenue chart ──────────────────────────────────────────────────────────

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface RevenueChartData {
  range: DateRange;
  data: RevenueDataPoint[];
}

// ── Asset distribution ─────────────────────────────────────────────────────

export interface AssetSlice {
  symbol: string;
  name: string;
  value_usd: number;
  percentage: number;
  color: string;
}

export interface AssetDistributionData {
  total_usd: number;
  assets: AssetSlice[];
}

// ── Recent activity ────────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  type: "payment" | "withdrawal" | "swap" | "deposit" | "refund";
  description: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  created_at: string;
}

// ── Dashboard query params ──────────────────────────────────────────────────

export interface DashboardParams {
  range: DateRange;
  currency: FiatCurrency;
}
