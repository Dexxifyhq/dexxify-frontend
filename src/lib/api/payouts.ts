import { get, post } from "@/lib/api-client";
import type {
  Payout,
  ResolvedAccount,
  BatchPayoutResult,
  CreatePayoutDto,
  BatchPayoutDto,
  ResolveAccountDto,
} from "@/lib/types/payouts";

export const payoutsApi = {
  // POST /payouts
  create: (payload: CreatePayoutDto) => post<Payout>("/payouts", payload),

  // POST /payouts/batch
  createBatch: (payload: BatchPayoutDto) =>
    post<BatchPayoutResult>("/payouts/batch", payload),

  // POST /payouts/resolve — name lookup
  resolveAccount: (payload: ResolveAccountDto) =>
    post<ResolvedAccount>("/payouts/resolve", payload),

  // GET /payouts/{payout_id}
  getById: (payoutId: string) => get<Payout>(`/payouts/${payoutId}`),
};
