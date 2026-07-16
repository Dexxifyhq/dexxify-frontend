import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentSessionsApi } from "@/lib/api/payment-sessions";

export const sessionKeys = {
  all: ["payment-sessions"] as const,
  list: () => [...sessionKeys.all, "list"] as const,
  detail: (id: string) => [...sessionKeys.all, "detail", id] as const,
  ref: (reference: string) => [...sessionKeys.all, "ref", reference] as const,
};

export function usePaymentSessions() {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: paymentSessionsApi.list,
    staleTime: 30_000,
  });
}

export function usePaymentSession(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () => paymentSessionsApi.getById(sessionId),
    enabled: !!sessionId,
    staleTime: 30_000,
  });
}

export function usePaymentSessionByRef(reference: string) {
  return useQuery({
    queryKey: sessionKeys.ref(reference),
    queryFn: () => paymentSessionsApi.getByReference(reference),
    enabled: !!reference,
    staleTime: 30_000,
  });
}

export function useCreatePaymentSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => paymentSessionsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.list() }),
  });
}

export function useEstimatePayment(
  params: {
    amount: string;
    currency: string;
    crypto_asset: string;
    network: string;
    reference?: string;
  } | null,
) {
  return useQuery({
    queryKey: [
      "session-estimate",
      params?.crypto_asset,
      params?.network,
      params?.amount,
      params?.currency,
    ],
    queryFn: () => paymentSessionsApi.getEstimate(params!),
    enabled: !!params?.crypto_asset && !!params?.network && !!params?.amount,
    staleTime: 30_000,
  });
}

export function useCancelPaymentSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => paymentSessionsApi.cancel(sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.all }),
  });
}
