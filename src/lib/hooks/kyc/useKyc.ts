import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { kycApi, type KycValidationDto, type RegistrationType } from "@/lib/api/kyc";

export const kycKeys = {
  individual: () => ["kyc", "individual"] as const,
  business: () => ["kyc", "business"] as const,
};

export function useIndividualKycStatus() {
  return useQuery({
    queryKey: kycKeys.individual(),
    queryFn: kycApi.getIndividualStatus,
    staleTime: 2 * 60 * 1000,
  });
}

export function useBusinessKycStatus() {
  return useQuery({
    queryKey: kycKeys.business(),
    queryFn: kycApi.getBusinessStatus,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVerifyBvn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { bvn: string; validation?: KycValidationDto }) =>
      kycApi.verifyBvn(dto),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: kycKeys.individual() });
      if (res?.status === "verified") toast.success("BVN verified successfully.");
      else toast.info("BVN submitted — awaiting confirmation.");
    },
    onError: (e: any) => toast.error(e.message ?? "BVN verification failed."),
  });
}

export function useVerifyNin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { nin: string; validation?: KycValidationDto }) =>
      kycApi.verifyNin(dto),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: kycKeys.individual() });
      if (res?.status === "verified") toast.success("NIN verified successfully.");
      else toast.info("NIN submitted — awaiting confirmation.");
    },
    onError: (e: any) => toast.error(e.message ?? "NIN verification failed."),
  });
}

export function useVerifyVnin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { vnin: string; validation?: KycValidationDto }) =>
      kycApi.verifyVnin(dto),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: kycKeys.individual() });
      if (res?.status === "verified") toast.success("vNIN verified successfully.");
      else toast.info("vNIN submitted — awaiting confirmation.");
    },
    onError: (e: any) => toast.error(e.message ?? "vNIN verification failed."),
  });
}

export function useVerifyCac() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: {
      rc_number: string;
      registration_type: RegistrationType;
      registration_name?: string;
    }) => kycApi.verifyCac(dto),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: kycKeys.business() });
      if (res?.status === "verified")
        toast.success("Business verified successfully.");
      else
        toast.error(
          "Business verification failed. Check your RC number and try again.",
        );
    },
    onError: (e: any) =>
      toast.error(e.message ?? "Business verification failed."),
  });
}
