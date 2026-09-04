import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { webhooksApi } from "@/lib/api/webhooks";
import type {
  SaveWebhookDto,
  ListWebhookEventsParams,
} from "@/lib/types/webhooks";

export const webhookKeys = {
  all: ["webhooks"] as const,
  detail: () => [...webhookKeys.all, "detail"] as const,
  events: (params: ListWebhookEventsParams) =>
    [...webhookKeys.all, "events", params] as const,
  event: (id: string) => [...webhookKeys.all, "events", id] as const,
};

// ── Endpoint query ─────────────────────────────────────────────────────────

export function useWebhook() {
  return useQuery({
    queryKey: webhookKeys.detail(),
    queryFn: webhooksApi.get,
    staleTime: 30_000,
  });
}

// ── Endpoint mutations ─────────────────────────────────────────────────────

export function useSaveWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveWebhookDto) => webhooksApi.save(payload),
    onSuccess: (data) => {
      qc.setQueryData(webhookKeys.detail(), data);
    },
  });
}

export function useRegenerateWebhookSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => webhooksApi.regenerateSecret(),
    onSuccess: ({ secret }) => {
      qc.setQueryData(webhookKeys.detail(), (old: any) =>
        old ? { ...old, secret } : old,
      );
    },
  });
}

export function useDeleteWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => webhooksApi.remove(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: webhookKeys.detail() });
    },
  });
}

// ── Delivery events ────────────────────────────────────────────────────────

export function useWebhookEvents(params: ListWebhookEventsParams = {}) {
  return useQuery({
    queryKey: webhookKeys.events(params),
    queryFn: () => webhooksApi.listEvents(params),
    staleTime: 15_000,
  });
}

export function useWebhookEvent(id: string | null) {
  return useQuery({
    queryKey: webhookKeys.event(id ?? ""),
    queryFn: () => webhooksApi.getEvent(id!),
    enabled: !!id,
  });
}
