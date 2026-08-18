import type { DateRange } from "./common";

// ── Stat change ────────────────────────────────────────────────────────────

export interface StatChange {
  value: number;
  percent: number;
  direction: "up" | "down" | "flat";
}

// ── Overview response (matches GET /dashboard/overview) ───────────────────

export interface SessionBreakdown {
  count: number;
  volume: number;
}

export interface InvoiceBreakdown {
  count: number;
  volume?: number;
}

export interface DashboardOverviewResponse {
  balances: { ngn: number; usdt: number; usdc: number };
  total_received: { ngn: number; usdt: number; usdc: number };
  payment_sessions: {
    total: number;
    completed?: SessionBreakdown;
    pending?: SessionBreakdown;
    expired?: SessionBreakdown;
    failed?: SessionBreakdown;
  };
  invoices: {
    total: number;
    paid?: InvoiceBreakdown;
    pending?: InvoiceBreakdown;
    overdue?: InvoiceBreakdown;
  };
  customers: { total: number; new_this_month: number };
  pending_payouts: { count: number; total_amount: number };
}

// ── Revenue chart (matches GET /dashboard/revenue-chart) ──────────────────

export interface RevenueDataPoint {
  date: string;
  revenue: number; // mapped from ngn for chart bar height
  ngn: number;
  usdt: number;
  usdc: number;
  tx_count: number;
}

export interface RevenueChartData {
  range: DateRange;
  period_days?: number;
  data: RevenueDataPoint[];
}

// ── Asset distribution (matches GET /dashboard/asset-distribution) ────────

export interface AssetSlice {
  symbol: string;
  name: string;
  value_usd: number;
  percentage: number;
  color: string;
  total_sessions?: number;
  completed?: number;
}

export interface AssetDistributionData {
  total_usd: number;
  assets: AssetSlice[];
}

// ── Recent activity (matches GET /dashboard/recent-activity) ──────────────

export interface ActivityItem {
  id: string;
  type: "payment" | "withdrawal" | "swap" | "deposit" | "refund";
  direction?: "credit" | "debit";
  description: string | null;
  amount: number;
  currency: string;
  asset?: string | null;
  status: "completed" | "pending" | "failed";
  created_at: string;
}

// ── Dashboard query params ────────────────────────────────────────────────

export interface DashboardParams {
  range: DateRange;
}
