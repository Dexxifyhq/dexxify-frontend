import { get } from "@/lib/api-client";
import type { DashboardStats, RevenueChartData, AssetDistributionData, ActivityItem, DashboardParams } from "@/lib/types/dashboard";

export const dashboardApi = {
  getStats: (params: DashboardParams) =>
    get<DashboardStats>("/dashboard/stats", {
      range: params.range,
      currency: params.currency,
    }),

  getRevenueChart: (params: DashboardParams) =>
    get<RevenueChartData>("/dashboard/revenue-chart", {
      range: params.range,
      currency: params.currency,
    }),

  getAssetDistribution: () =>
    get<AssetDistributionData>("/dashboard/asset-distribution"),

  getRecentActivity: (limit = 10) =>
    get<ActivityItem[]>("/dashboard/recent-activity", { limit }),
};
