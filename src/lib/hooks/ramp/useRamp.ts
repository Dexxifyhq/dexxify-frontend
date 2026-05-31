import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rampApi } from "@/lib/api/ramp";
import type { CreateOfframpDto, CreateOnrampDto } from "@/lib/types/ramp";

export const rampKeys = {
  all: ["ramp"] as const,
  offramp: (txId: string) => [...rampKeys.all, "offramp", txId] as const,
  onramp: (txId: string) => [...rampKeys.all, "onramp", txId] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

export function useOfframp(txId: string) {
  return useQuery({
    queryKey: rampKeys.offramp(txId),
    queryFn: () => rampApi.getOfframp(txId),
    enabled: !!txId,
    staleTime: 15_000,
  });
}

export function useOnramp(txId: string) {
  return useQuery({
    queryKey: rampKeys.onramp(txId),
    queryFn: () => rampApi.getOnramp(txId),
    enabled: !!txId,
    staleTime: 15_000,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateOfframp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOfframpDto) => rampApi.createOfframp(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rampKeys.all });
    },
  });
}

export function useCreateOnramp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOnrampDto) => rampApi.createOnramp(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rampKeys.all });
    },
  });
}
