import { get } from "@/lib/api-client";
import type { Payout } from "@/lib/types/payouts";

export interface PayoutListParams {
  page?: number;
  size?: number;
}

export const payoutsApi = {
  // GET /payouts/{payout_id}
  getById: (payoutId: string) => get<Payout>(`/payouts/${payoutId}`),

  // GET /payouts?page=&size=
  getList: (params: PayoutListParams = {}) =>
    get<Payout[]>(`/payouts`, {
      page: params.page ?? 1,
      size: params.size ?? 20,
    }),
};
