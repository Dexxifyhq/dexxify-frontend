export type RefundStatus = "pending" | "processing" | "completed" | "failed";
export type RefundFeePaidBy = "merchant" | "customer";

export interface Refund {
  id: string;
  reference: string;
  sessionReference: string | null;
  status: RefundStatus;
  amount: string | null;
  asset: string | null;
  chain: string | null;
  refundAddress: string;
  reason: string | null;
  feePaidBy: RefundFeePaidBy | null;
  fee: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RefundFilters {
  status?: RefundStatus;
  sessionReference?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface CreateRefundDto {
  refundAddress: string;
  reason?: string;
  feePaidBy?: RefundFeePaidBy;
}

export interface RefundEstimate {
  amount: string;
  asset: string;
  chain: string;
  fee: string;
  feePaidBy: RefundFeePaidBy;
  netAmount: string;
}
