import { get, post, del } from "@/lib/api-client";
import type { Webhook, CreateWebhookDto } from "@/lib/types/webhooks";

export const webhooksApi = {
  // POST /webhooks
  create: (payload: CreateWebhookDto) => post<Webhook>("/webhooks", payload),

  // GET /webhooks
  getAll: () => get<Webhook[]>("/webhooks"),

  // DELETE /webhooks/{id}
  delete: (id: string) => del<{ message: string }>(`/webhooks/${id}`),
};
