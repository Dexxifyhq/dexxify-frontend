import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import type { DashboardParams } from "@/lib/types/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (params: DashboardParams) => [...dashboardKeys.all, "stats", params] as const,
  revenueChart: (params: DashboardParams) => [...dashboardKeys.all, "revenue-chart", params] as const,
  assetDistribution: () => [...dashboardKeys.all, "asset-distribution"] as const,
  recentActivity: (limit: number) => [...dashboardKeys.all, "recent-activity", limit] as const,
};

export function useDashboardStats(params: DashboardParams) {
  return useQuery({
    queryKey: dashboardKeys.stats(params),
    queryFn: () => dashboardApi.getStats(params),
    staleTime: 30_000,
  });
}

export function useRevenueChart(params: DashboardParams) {
  return useQuery({
    queryKey: dashboardKeys.revenueChart(params),
    queryFn: () => dashboardApi.getRevenueChart(params),
    staleTime: 30_000,
  });
}

export function useAssetDistribution() {
  return useQuery({
    queryKey: dashboardKeys.assetDistribution(),
    queryFn: dashboardApi.getAssetDistribution,
    staleTime: 60_000,
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(limit),
    queryFn: () => dashboardApi.getRecentActivity(limit),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
