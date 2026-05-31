import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kycApi } from "@/lib/api/kyc";
import type {
  LivenessCheckDto,
  VerifyBvnDto,
  VerifyDocumentDto,
  VerifyNinDto,
} from "@/lib/types/kyc";

export const kycKeys = {
  all: ["kyc"] as const,
  status: (userId: string) => [...kycKeys.all, "status", userId] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

export function useKycStatus(userId: string) {
  return useQuery({
    queryKey: kycKeys.status(userId),
    queryFn: () => kycApi.getStatus(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

function invalidateStatus(qc: ReturnType<typeof useQueryClient>, userId: string) {
  qc.invalidateQueries({ queryKey: kycKeys.status(userId) });
}

export function useVerifyBvn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyBvnDto) => kycApi.verifyBvn(payload),
    onSuccess: (_data, variables) =>
      invalidateStatus(qc, variables.external_user_id),
  });
}

export function useVerifyNin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyNinDto) => kycApi.verifyNin(payload),
    onSuccess: (_data, variables) =>
      invalidateStatus(qc, variables.external_user_id),
  });
}

export function useVerifyDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyDocumentDto) => kycApi.verifyDocument(payload),
    onSuccess: (_data, variables) =>
      invalidateStatus(qc, variables.external_user_id),
  });
}

export function useLivenessCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LivenessCheckDto) => kycApi.livenessCheck(payload),
    onSuccess: (_data, variables) =>
      invalidateStatus(qc, variables.external_user_id),
  });
}
