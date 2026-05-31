import { get } from "@/lib/api-client";
import type { HealthStatus } from "@/lib/types/system";

export const systemApi = {
  // GET /health — public health check (cookie realm; no auth required)
  getHealth: () => get<HealthStatus>("/health"),
};
