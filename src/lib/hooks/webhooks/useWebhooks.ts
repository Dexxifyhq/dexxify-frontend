import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { webhooksApi } from "@/lib/api/webhooks";
import type { CreateWebhookDto } from "@/lib/types/webhooks";

export const webhookKeys = {
  all: ["webhooks"] as const,
  list: () => [...webhookKeys.all, "list"] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

export function useWebhooks() {
  return useQuery({
    queryKey: webhookKeys.list(),
    queryFn: webhooksApi.getAll,
    staleTime: 30_000,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWebhookDto) => webhooksApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: webhookKeys.list() });
    },
  });
}

export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => webhooksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: webhookKeys.list() });
    },
  });
}
