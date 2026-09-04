import { get, put, post, del, getPaginated } from "@/lib/api-client";
import type {
  WebhookEndpoint,
  SaveWebhookDto,
  RegenerateSecretResponse,
  RemoveWebhookResponse,
  WebhookDeliveryEvent,
  WebhookDeliveryEventDetail,
  ListWebhookEventsParams,
} from "@/lib/types/webhooks";

export const webhooksApi = {
  // GET /webhooks — the endpoint for the current mode (live/test)
  get: () => get<WebhookEndpoint>("/webhooks"),

  // PUT /webhooks — create or update the endpoint for the current mode
  save: (payload: SaveWebhookDto) => put<WebhookEndpoint>("/webhooks", payload),

  // POST /webhooks/regenerate-secret
  regenerateSecret: () =>
    post<RegenerateSecretResponse>("/webhooks/regenerate-secret"),

  // DELETE /webhooks
  remove: () => del<RemoveWebhookResponse>("/webhooks"),

  // GET /webhooks/events?page=&limit=&status= — paginated delivery log
  listEvents: (params: ListWebhookEventsParams = {}) =>
    getPaginated<WebhookDeliveryEvent>("/webhooks/events", {
      page: params.page,
      limit: params.limit,
      ...(params.status ? { status: params.status } : {}),
    }),

  // GET /webhooks/events/{id} — single delivery record, full payload/response
  getEvent: (id: string) =>
    get<WebhookDeliveryEventDetail>(`/webhooks/events/${id}`),
};
