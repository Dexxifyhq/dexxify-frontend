import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  developersApi,
  type UpdateProfileDto,
  type ChangePasswordDto,
} from "@/lib/api/developers";

export const developerKeys = {
  all: ["developers"] as const,
  me: () => [...developerKeys.all, "me"] as const,
};

export function useMyDeveloperProfile() {
  return useQuery({
    queryKey: developerKeys.me(),
    queryFn: developersApi.getMe,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateDeveloperProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => developersApi.updateProfile(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: developerKeys.me() });
      toast.success("Profile updated.");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to update profile."),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => developersApi.changePassword(dto),
    onSuccess: () => toast.success("Password changed successfully."),
    onError: (e: any) =>
      toast.error(e.message ?? "Failed to change password."),
  });
}
