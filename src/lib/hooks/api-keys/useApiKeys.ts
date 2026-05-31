import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiKeysApi } from "@/lib/api/api-keys";
import type {
  CreateApiKeyDto,
  UpdateApiKeyDto,
  DashboardUsageFilters,
} from "@/lib/types/api-keys";

export const apiKeyKeys = {
  all: ["api-keys"] as const,
  list: () => [...apiKeyKeys.all, "list"] as const,
  dashboardOverview: () => ["dashboard-meta", "overview"] as const,
  dashboardUsage: (filters: DashboardUsageFilters) =>
    ["dashboard-meta", "usage", filters] as const,
};

// ── API key queries / mutations ────────────────────────────────────────────

export function useApiKeys() {
  return useQuery({
    queryKey: apiKeyKeys.list(),
    queryFn: apiKeysApi.getAll,
    staleTime: 30_000,
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApiKeyDto) => apiKeysApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: apiKeyKeys.list() });
    },
  });
}

export function useUpdateApiKey(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateApiKeyDto) => apiKeysApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: apiKeyKeys.list() });
    },
  });
}

export function useDeleteApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeysApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: apiKeyKeys.list() });
    },
  });
}

// ── Dashboard meta queries ─────────────────────────────────────────────────

export function useDashboardOverview() {
  return useQuery({
    queryKey: apiKeyKeys.dashboardOverview(),
    queryFn: apiKeysApi.getOverview,
    staleTime: 30_000,
  });
}

export function useDashboardUsage(filters: DashboardUsageFilters = {}) {
  return useQuery({
    queryKey: apiKeyKeys.dashboardUsage(filters),
    queryFn: () => apiKeysApi.getUsage(filters),
    staleTime: 60_000,
  });
}
