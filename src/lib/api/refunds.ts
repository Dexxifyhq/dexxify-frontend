import { get, post } from "@/lib/api-client";
import type { CreateRefundDto, RefundFilters } from "@/lib/types/refunds";

export const refundsApi = {
  // GET /refunds
  list: (filters: RefundFilters = {}) =>
    get<any>("/refunds", {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.sessionReference ? { sessionReference: filters.sessionReference } : {}),
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.startDate ? { startDate: filters.startDate } : {}),
      ...(filters.endDate ? { endDate: filters.endDate } : {}),
      page: filters.page ?? 1,
      size: filters.size ?? 100,
    }),

  // GET /refunds/:id
  getById: (id: string) => get<any>(`/refunds/${id}`),

  // GET /refunds/estimate/:reference?entity=session
  estimate: (reference: string, feePaidBy?: "merchant" | "customer") =>
    get<any>(`/refunds/estimate/${reference}`, {
      entity: "session",
      ...(feePaidBy ? { feePaidBy } : {}),
    }),

  // POST /refunds/session/:sessionReference
  refundSession: (sessionReference: string, dto: CreateRefundDto) =>
    post<any>(`/refunds/session/${sessionReference}`, dto),
};
