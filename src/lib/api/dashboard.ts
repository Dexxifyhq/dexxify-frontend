import { get, ApiError } from "@/lib/api-client";
import type {
  DashboardStats,
  DashboardOverviewResponse,
  RevenueChartData,
  AssetDistributionData,
  AssetSlice,
  ActivityItem,
  DashboardParams,
  StatChange,
} from "@/lib/types/dashboard";
import type { DateRange, PaginatedResponse } from "@/lib/types/common";
import type { LedgerTransaction } from "@/lib/types/ledger";
import type { WalletDetails } from "@/lib/types/wallet";

/**
 * The backend does not expose dedicated /dashboard/stats, /dashboard/revenue-chart,
 * /dashboard/asset-distribution or /dashboard/recent-activity endpoints.
 *
 * This adapter layer maps the UI's expected shapes onto the real endpoints:
 *   - stats           ← GET /dashboard/overview (best-effort field mapping)
 *   - revenueChart    ← GET /dashboard/usage    (repurposed: requests timeline)
 *   - assetDist       ← GET /wallets/details/all (derived client-side)
 *   - recentActivity  ← GET /transactions?limit=N
 *
 * UI hooks and types are preserved — no page changes required.
 */

// ── Safe wrapper (404 → null keeps the UI in empty state) ──────────────────

async function safeGet<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T | null> {
  try {
    return await get<T>(url, params);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

const FLAT_CHANGE: StatChange = { value: 0, percent: 0, direction: "flat" };

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
      return 365;
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
};

function assetColor(symbol: string): string {
  return ASSET_COLORS[symbol.toUpperCase()] ?? "#71717A";
}

// ── Public API ─────────────────────────────────────────────────────────────

export const dashboardApi = {
  /**
   * GET /dashboard/overview → DashboardStats. The verified response nests
   * counts + NGN volumes:
   *   { wallets:{total}, payouts:{total,volume_ngn},
   *     offramps:{total,volume_ngn}, kyc_verifications:{total},
   *     total_volume_ngn }
   * Read directly. No deltas are returned, so every change renders flat.
   * The `_params` (range/currency) aren't supported by this endpoint yet —
   * kept for signature parity with the hook.
   */
  getStats: async (
    _params: DashboardParams,
  ): Promise<DashboardStats | null> => {
    const raw = await safeGet<DashboardOverviewResponse>("/dashboard/overview");
    if (!raw) return null;

    return {
      total_volume: {
        value: num(raw.total_volume_ngn),
        change: FLAT_CHANGE,
        currency: "NGN",
      },
      wallets: {
        value: num(raw.wallets?.total),
        change: FLAT_CHANGE,
      },
      payouts: {
        value: num(raw.payouts?.total),
        change: FLAT_CHANGE,
      },
      kyc_verifications: {
        value: num(raw.kyc_verifications?.total),
        change: FLAT_CHANGE,
      },
    };
  },

  /**
   * GET /dashboard/usage repurposed as a revenue chart. Usage days are
   * mapped to RevenueDataPoint with `revenue` = request count for now.
   * When the backend ships a real revenue timeseries endpoint, swap here.
   */
  getRevenueChart: async (
    params: DashboardParams,
  ): Promise<RevenueChartData | null> => {
    const usage = await safeGet<{
      days?: Array<{ date: string; requests?: number }>;
    }>("/dashboard/usage", { days: rangeToDays(params.range) });
    if (!usage?.days?.length) return null;

    return {
      range: params.range,
      data: usage.days.map((d) => ({
        date: d.date,
        revenue: num(d.requests),
      })),
    };
  },

  /**
   * Derived client-side from /wallets/details/all. Each wallet's balance is
   * tallied by asset symbol and converted to a percentage of total.
   */
  getAssetDistribution: async (): Promise<AssetDistributionData | null> => {
    const wallets = await safeGet<WalletDetails[]>("/wallets/details/all");
    if (!wallets?.length) return null;

    const tally = new Map<string, number>();
    for (const w of wallets) {
      const symbol = String(w.asset_symbol ?? "UNKNOWN").toUpperCase();
      const balanceUsd = num(w.balance);
      tally.set(symbol, (tally.get(symbol) ?? 0) + balanceUsd);
    }

    const total = Array.from(tally.values()).reduce((a, b) => a + b, 0);
    if (total <= 0) return { total_usd: 0, assets: [] };

    const assets: AssetSlice[] = Array.from(tally.entries()).map(
      ([symbol, value_usd]) => ({
        symbol,
        name: symbol,
        value_usd,
        percentage: (value_usd / total) * 100,
        color: assetColor(symbol),
      }),
    );

    assets.sort((a, b) => b.value_usd - a.value_usd);
    return { total_usd: total, assets };
  },

  /**
   * GET /transactions?limit=N → ActivityItem[]. Maps ledger tx types to
   * the UI's activity type vocabulary.
   */
  getRecentActivity: async (limit = 10): Promise<ActivityItem[] | null> => {
    const res = await safeGet<PaginatedResponse<LedgerTransaction>>(
      "/transactions",
      { page: 1, limit },
    );
    if (!res) return null;

    const mapType = (t: string): ActivityItem["type"] => {
      switch (t) {
        case "deposit":
        case "credit":
        case "onramp":
          return "deposit";
        case "withdrawal":
        case "debit":
        case "offramp":
          return "withdrawal";
        case "swap":
          return "swap";
        case "payout":
          return "payment";
        default:
          return "payment";
      }
    };

    const mapStatus = (s: string): ActivityItem["status"] => {
      if (s === "completed" || s === "successful") return "completed";
      if (s === "failed" || s === "cancelled") return "failed";
      return "pending";
    };

    return res.data.map((tx) => ({
      id: tx.id,
      type: mapType(tx.tx_type),
      description: tx.description ?? tx.reference_id,
      amount: num(tx.amount_usd ?? tx.credit_usd ?? tx.debit_usd ?? tx.credit_ngn ?? tx.debit_ngn),
      currency: tx.asset ?? "USD",
      status: mapStatus(tx.status),
      created_at: tx.created_at,
    }));
  },
};
