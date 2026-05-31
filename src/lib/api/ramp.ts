import { get, post } from "@/lib/api-client";
import type {
  OfframpTransaction,
  OnrampTransaction,
  CreateOfframpDto,
  CreateOnrampDto,
} from "@/lib/types/ramp";

export const rampApi = {
  // POST /offramp — crypto → fiat
  createOfframp: (payload: CreateOfframpDto) =>
    post<OfframpTransaction>("/offramp", payload),

  // GET /offramp/{tx_id}
  getOfframp: (txId: string) => get<OfframpTransaction>(`/offramp/${txId}`),

  // POST /onramp — fiat → crypto
  createOnramp: (payload: CreateOnrampDto) =>
    post<OnrampTransaction>("/onramp", payload),

  // GET /onramp/{tx_id}
  getOnramp: (txId: string) => get<OnrampTransaction>(`/onramp/${txId}`),
};
