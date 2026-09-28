import { get, post, del } from "@/lib/api-client";
import type {
  PosDevice,
  InitiatePosDeviceLinkResponse,
} from "@/lib/types/pos-devices";

export const posDevicesApi = {
  // POST /pos-devices/link/initiate
  initiateLink: () =>
    post<InitiatePosDeviceLinkResponse>("/pos-devices/link/initiate"),

  // GET /pos-devices
  getAll: () => get<PosDevice[]>("/pos-devices"),

  // DELETE /pos-devices/{id}
  revoke: (id: string) => del<{ message: string }>(`/pos-devices/${id}`),
};
