import { get, post } from "@/lib/api-client";

export interface KycVerificationRecord {
  id: string;
  type: "bvn" | "nin" | "vnin" | "cac";
  status: "pending" | "verified" | "failed" | "expired";
  provider_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface IndividualKycStatus {
  overall_status: "verified" | "failed" | "pending" | "incomplete";
  verifications: KycVerificationRecord[];
}

export type RegistrationType = "RC" | "BN" | "IT" | "LP" | "LLP";

export const REGISTRATION_TYPES: { value: RegistrationType; label: string }[] =
  [
    { value: "RC", label: "RC — Incorporated Company" },
    { value: "BN", label: "BN — Business Name" },
    { value: "IT", label: "IT — Incorporated Trustee" },
    { value: "LP", label: "LP — Limited Partnership" },
    { value: "LLP", label: "LLP — Limited Liability Partnership" },
  ];

export interface CacValidationInput {
  registration_type: RegistrationType;
  registration_name?: string;
}

export interface BusinessKycStatus {
  verified: boolean;
  verification:
    | (KycVerificationRecord & { validation_input: CacValidationInput | null })
    | null;
}

export interface KycValidationDto {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
}

export const kycApi = {
  getIndividualStatus: () => get<IndividualKycStatus>("/kyc/individual/status"),
  getBusinessStatus: () => get<BusinessKycStatus>("/kyc/business/status"),
  verifyBvn: (dto: { bvn: string; validation?: KycValidationDto }) =>
    post<{ id: string; status: string; message: string }>("/kyc/bvn", dto),
  verifyNin: (dto: { nin: string; validation?: KycValidationDto }) =>
    post<{ id: string; status: string; message: string }>("/kyc/nin", dto),
  verifyVnin: (dto: { vnin: string; validation?: KycValidationDto }) =>
    post<{ id: string; status: string; message: string }>("/kyc/vnin", dto),
  verifyCac: (dto: {
    rc_number: string;
    registration_type: RegistrationType;
    registration_name?: string;
  }) => post<{ id: string; status: string; message: string }>("/kyc/cac", dto),
};
