import type { DateRange, FiatCurrency } from "./common";

// ── Stats ──────────────────────────────────────────────────────────────────

export interface StatCard {
  total_revenue: number;
  total_sessions: number;
  transactions: number;
  customers: number;
}

export interface StatChange {
  value: number;
  percent: number;
  direction: "up" | "down" | "flat";
}

export interface DashboardStats {
  total_revenue: { value: number; change: StatChange; currency: FiatCurrency };
  total_sessions: { value: number; change: StatChange };
  transactions: { value: number; change: StatChange };
  customers: { value: number; change: StatChange };
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
