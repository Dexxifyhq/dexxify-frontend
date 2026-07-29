import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  businessesApi,
  type UpdateBusinessProfileDto,
  type UpdateSettlementsDto,
  type UpdateNotificationsDto,
} from "@/lib/api/businesses";
import { authApi } from "@/lib/auth-api";

export const businessKeys = {
  all: ["businesses"] as const,
  list: () => [...businessKeys.all, "list"] as const,
  me: () => [...businessKeys.all, "me"] as const,
};

export function useMyBusinesses() {
  return useQuery({
    queryKey: businessKeys.list(),
    queryFn: businessesApi.getAll,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSelectBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (businessId: string) =>
      authApi.selectBusiness({ business_id: businessId }),
    onSuccess: (data) => {
      const biz = data?.business;

      // Immediately seed the "me" cache with the returned business so the
      // sidebar shows the new name/logo without waiting for a refetch.
      if (biz) {
        qc.setQueryData(businessKeys.me(), (old: any) =>
          old
            ? { ...old, id: biz.id, name: biz.name, logo_url: biz.logo_url }
            : biz,
        );
      }

      // Refetch the profile so business_name + business_id reflect the new workspace.
      qc.invalidateQueries({ queryKey: ["profile"] });

      // Invalidate the business list so the switcher shows the correct active marker.
      qc.invalidateQueries({ queryKey: businessKeys.list() });

      // Clear all workspace-scoped data (transactions, payment-pages, etc.)
      // so active queries refetch against the newly selected business.
      qc.removeQueries({
        predicate: (q) =>
          q.queryKey[0] !== "businesses" && q.queryKey[0] !== "profile",
      });

      toast.success(biz ? `Switched to ${biz.name}.` : "Workspace switched.");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to switch business."),
  });
}

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
    mutationFn: (dto: { name: string; type: string; email: string }) =>
      businessesApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.all });
      toast.success("New business created.");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to create business."),
  });
}
