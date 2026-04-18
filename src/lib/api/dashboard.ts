import { get, ApiError } from "@/lib/api-client";
import type {
  DashboardStats,
  RevenueChartData,
  AssetDistributionData,
  ActivityItem,
  DashboardParams,
} from "@/lib/types/dashboard";

/**
 * Wraps a GET call so that a 404 (endpoint not yet implemented on the backend)
 * resolves to null instead of throwing. This keeps the UI in a clean empty
 * state rather than an error state while the backend is being built out.
 */
async function safeGet<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T | null> {
  try {
    return await get<T>(url, params);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export const dashboardApi = {
  getStats: (params: DashboardParams) =>
    safeGet<DashboardStats>("/dashboard/stats", {
      range: params.range,
      currency: params.currency,
    }),

  getRevenueChart: (params: DashboardParams) =>
    safeGet<RevenueChartData>("/dashboard/revenue-chart", {
      range: params.range,
      currency: params.currency,
    }),

  getAssetDistribution: () =>
    safeGet<AssetDistributionData>("/dashboard/asset-distribution"),

  getRecentActivity: (limit = 10) =>
    safeGet<ActivityItem[]>("/dashboard/recent-activity", { limit }),
};
