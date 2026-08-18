import { get, ApiError } from "@/lib/api-client";
import type {
  DashboardOverviewResponse,
  RevenueChartData,
  AssetDistributionData,
  AssetSlice,
  ActivityItem,
  DashboardParams,
} from "@/lib/types/dashboard";
import type { DateRange } from "@/lib/types/common";

// ── Safe wrapper ────────────────────────────────────────────────────────────

async function safeGet<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T | null> {
  try {
    const res = await get<T>(url, params);
    return res;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

function rangeToDays(range: DateRange): number {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "1y":
    case "all":
      return 365;
    default:
      return 30;
  }
}

const ASSET_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  USDT: "#26A17B",
  USDC: "#2775CA",
  BNB: "#F3BA2F",
  SOL: "#9945FF",
  TRX: "#E84040",
  TON: "#0088CC",
};

function assetColor(symbol: string): string {
  return ASSET_COLORS[symbol.toUpperCase()] ?? "#71717A";
}

// ── Public API ──────────────────────────────────────────────────────────────

export const dashboardApi = {
  /**
   * GET /dashboard/overview
   * Full response, unmapped — powers the stat cards plus widgets that need
   * the session/invoice status breakdown and per-currency balances.
   */
  getOverview: (): Promise<DashboardOverviewResponse | null> =>
    safeGet<DashboardOverviewResponse>("/dashboard/overview"),

  /**
   * GET /dashboard/revenue-chart?days=N
   * Returns a flat array of daily NGN/USDT/USDC credits. Maps ngn → revenue
   * for bar height.
   */
  getRevenueChart: async (
    params: DashboardParams,
  ): Promise<RevenueChartData | null> => {
    const raw = await safeGet<
      Array<{
        date: string;
        ngn: number;
        usdt: number;
        usdc: number;
        tx_count: number;
      }>
    >("/dashboard/revenue-chart", { days: rangeToDays(params.range) });

    if (!raw || raw.length === 0) return null;

    return {
      range: params.range,
      data: raw.map((d) => ({
        date: d.date,
        revenue: num(d.ngn),
        ngn: num(d.ngn),
        usdt: num(d.usdt),
        usdc: num(d.usdc),
        tx_count: num(d.tx_count),
      })),
    };
  },

  /**
   * GET /dashboard/asset-distribution
   * Payment sessions grouped by crypto asset — builds donut chart slices.
   */
  getAssetDistribution: async (): Promise<AssetDistributionData | null> => {
    const raw = await safeGet<
      Array<{
        asset: string;
        network: string;
        total_sessions: number;
        completed: number;
        pending: number;
        total_volume: number;
      }>
    >("/dashboard/asset-distribution");

    if (!raw || raw.length === 0) return null;

    const total = raw.reduce((sum, r) => sum + num(r.total_volume), 0);

    const assets: AssetSlice[] = raw.map((r) => ({
      symbol: r.asset,
      name: `${r.asset} (${r.network})`,
      value_usd: num(r.total_volume),
      percentage: total > 0 ? (num(r.total_volume) / total) * 100 : 0,
      color: assetColor(r.asset),
      total_sessions: r.total_sessions,
      completed: r.completed,
    }));

    assets.sort((a, b) => b.value_usd - a.value_usd);
    return { total_usd: total, assets };
  },

  /**
   * GET /dashboard/recent-activity?limit=N
   * Ledger entries shaped for the activity feed.
   */
  getRecentActivity: async (limit = 10): Promise<ActivityItem[] | null> => {
    const raw = await safeGet<
      Array<{
        id: string;
        type: string;
        direction: "credit" | "debit";
        amount: number;
        currency: string;
        asset: string | null;
        status: string;
        description: string | null;
        created_at: string;
      }>
    >("/dashboard/recent-activity", { limit });

    if (!raw || raw.length === 0) return null;

    const mapType = (t: string): ActivityItem["type"] => {
      if (t === "deposit" || t === "onramp") return "deposit";
      if (t === "withdrawal" || t === "offramp") return "withdrawal";
      if (t === "swap") return "swap";
      if (t === "refund") return "refund";
      return "payment";
    };

    const mapStatus = (s: string): ActivityItem["status"] => {
      if (s === "completed") return "completed";
      if (s === "rejected" || s === "reversed" || s === "failed")
        return "failed";
      return "pending";
    };

    return raw.map((e) => ({
      id: e.id,
      type: mapType(e.type),
      direction: e.direction,
      description: e.description,
      amount: num(e.amount),
      currency: e.currency,
      asset: e.asset,
      status: mapStatus(e.status),
      created_at: String(e.created_at),
    }));
  },
};
