import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { posDevicesApi } from "@/lib/api/pos-devices";

export const posDeviceKeys = {
  all: ["pos-devices"] as const,
  list: () => [...posDeviceKeys.all, "list"] as const,
};

export function usePosDevices() {
  return useQuery({
    queryKey: posDeviceKeys.list(),
    queryFn: posDevicesApi.getAll,
    staleTime: 15_000,
  });
}

export function useInitiatePosDeviceLink() {
  return useMutation({
    mutationFn: () => posDevicesApi.initiateLink(),
  });
}

export function useRevokePosDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => posDevicesApi.revoke(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: posDeviceKeys.list() });
    },
  });
}
