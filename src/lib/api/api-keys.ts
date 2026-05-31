import { get, post, patch, del } from "@/lib/api-client";
import type {
  ApiKey,
  CreateApiKeyDto,
  UpdateApiKeyDto,
  DashboardOverview,
  DashboardUsage,
  DashboardUsageFilters,
} from "@/lib/types/api-keys";

export const apiKeysApi = {
  // POST /dashboard/api-keys
  create: (payload: CreateApiKeyDto) =>
    post<ApiKey>("/dashboard/api-keys", payload),

  // GET /dashboard/api-keys
  getAll: () => get<ApiKey[]>("/dashboard/api-keys"),

  // PATCH /dashboard/api-keys/{id}
  update: (id: string, payload: UpdateApiKeyDto) =>
    patch<ApiKey>(`/dashboard/api-keys/${id}`, payload),

  // DELETE /dashboard/api-keys/{id}
  delete: (id: string) => del<{ message: string }>(`/dashboard/api-keys/${id}`),

  // GET /dashboard/overview
  getOverview: () => get<DashboardOverview>("/dashboard/overview"),

  // GET /dashboard/usage
  getUsage: (filters: DashboardUsageFilters = {}) =>
    get<DashboardUsage>("/dashboard/usage", {
      ...(filters.days ? { days: filters.days } : {}),
    }),
};
