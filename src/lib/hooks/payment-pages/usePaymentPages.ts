import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentPagesApi } from "@/lib/api/payment-pages";

export const pageKeys = {
  all: ["payment-pages"] as const,
  list: () => [...pageKeys.all, "list"] as const,
  detail: (id: string) => [...pageKeys.all, "detail", id] as const,
  sessions: (id: string) => [...pageKeys.all, "sessions", id] as const,
};

export function usePaymentPages() {
  return useQuery({
    queryKey: pageKeys.list(),
    queryFn: paymentPagesApi.list,
    staleTime: 30_000,
  });
}

export function usePaymentPage(id: string) {
  return useQuery({
    queryKey: pageKeys.detail(id),
    queryFn: () => paymentPagesApi.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function usePaymentPageSessions(id: string) {
  return useQuery({
    queryKey: pageKeys.sessions(id),
    queryFn: () => paymentPagesApi.getSessions(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreatePaymentPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => paymentPagesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: pageKeys.list() }),
  });
}

export function useUpdatePaymentPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      paymentPagesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: pageKeys.all }),
  });
}

export function useDeletePaymentPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentPagesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: pageKeys.all }),
  });
}
