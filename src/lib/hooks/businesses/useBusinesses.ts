import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  businessesApi,
  type UpdateBusinessProfileDto,
  type UpdateSettlementsDto,
  type UpdateNotificationsDto,
} from "@/lib/api/businesses";

export const businessKeys = {
  all: ["businesses"] as const,
  me: () => [...businessKeys.all, "me"] as const,
};

export function useMyBusiness() {
  return useQuery({
    queryKey: businessKeys.me(),
    queryFn: businessesApi.getMe,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateBusinessProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateBusinessProfileDto) =>
      businessesApi.updateProfile(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.me() });
      toast.success("Business profile updated.");
    },
    onError: (e: any) =>
      toast.error(e.message ?? "Failed to update business profile."),
  });
}

export function useUpdateSettlements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateSettlementsDto) =>
      businessesApi.updateSettlements(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.me() });
      toast.success("Settlement preferences saved.");
    },
    onError: (e: any) =>
      toast.error(e.message ?? "Failed to update settlements."),
  });
}

export function useUpdateNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateNotificationsDto) =>
      businessesApi.updateNotifications(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.me() });
      toast.success("Notification preferences saved.");
    },
    onError: (e: any) =>
      toast.error(e.message ?? "Failed to update notifications."),
  });
}

export function useCreateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; type?: string }) =>
      businessesApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.all });
      toast.success("New business created.");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to create business."),
  });
}
