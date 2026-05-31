// ── KYC types ──────────────────────────────────────────────────────────────

export type KycCheckType = "bvn" | "nin" | "document" | "liveness";

export type KycStatus =
  | "pending"
  | "verified"
  | "failed"
  | "rejected"
  | "not_started";

export type DocumentType = "national_id" | "passport" | "drivers_licence";

export interface KycCheckResult {
  external_user_id: string;
  type: KycCheckType;
  status: KycStatus;
  reference?: string;
  reason?: string;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface KycStatusResponse {
  user_id: string;
  overall_status: KycStatus;
  checks: {
    bvn?: KycStatus;
    nin?: KycStatus;
    document?: KycStatus;
    liveness?: KycStatus;
  };
  updated_at?: string;
}

// ── DTOs ───────────────────────────────────────────────────────────────────

export interface VerifyBvnDto {
  external_user_id: string;
  bvn: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
}

export interface VerifyNinDto {
  external_user_id: string;
  nin: string;
  first_name: string;
  last_name: string;
}

export interface VerifyDocumentDto {
  external_user_id: string;
  document_type: DocumentType;
  document_url: string;
  first_name: string;
  last_name: string;
}

export interface LivenessCheckDto {
  external_user_id: string;
  selfie_url: string;
  document_url?: string;
}
