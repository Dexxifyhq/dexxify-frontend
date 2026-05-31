import { get, post } from "@/lib/api-client";
import type {
  KycCheckResult,
  KycStatusResponse,
  VerifyBvnDto,
  VerifyNinDto,
  VerifyDocumentDto,
  LivenessCheckDto,
} from "@/lib/types/kyc";

export const kycApi = {
  // POST /kyc/bvn
  verifyBvn: (payload: VerifyBvnDto) =>
    post<KycCheckResult>("/kyc/bvn", payload),

  // POST /kyc/nin
  verifyNin: (payload: VerifyNinDto) =>
    post<KycCheckResult>("/kyc/nin", payload),

  // POST /kyc/document
  verifyDocument: (payload: VerifyDocumentDto) =>
    post<KycCheckResult>("/kyc/document", payload),

  // POST /kyc/liveness
  livenessCheck: (payload: LivenessCheckDto) =>
    post<KycCheckResult>("/kyc/liveness", payload),

  // GET /kyc/{user_id}/status
  getStatus: (userId: string) =>
    get<KycStatusResponse>(`/kyc/${userId}/status`),
};
