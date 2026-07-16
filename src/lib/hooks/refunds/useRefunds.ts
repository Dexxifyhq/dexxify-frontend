import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { refundsApi } from "@/lib/api/refunds";
import type { CreateRefundDto, RefundFilters } from "@/lib/types/refunds";

export const refundKeys = {
  all: ["refunds"] as const,
  list: (filters: RefundFilters) => [...refundKeys.all, "list", filters] as const,
  detail: (id: string) => [...refundKeys.all, "detail", id] as const,
};

export function useRefunds(filters: RefundFilters = {}) {
  return useQuery({
    queryKey: refundKeys.list(filters),
    queryFn: () => refundsApi.list(filters),
    staleTime: 30_000,
  });
}

export function useRefundSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionReference,
      dto,
    }: {
      sessionReference: string;
      dto: CreateRefundDto;
    }) => refundsApi.refundSession(sessionReference, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: refundKeys.all });
    },
  });
}
