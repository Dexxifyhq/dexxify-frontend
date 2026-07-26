import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  teamsApi,
  type InviteMemberDto,
  type UpdateMemberDto,
} from "@/lib/api/teams";

export const teamKeys = {
  all: ["teams"] as const,
  members: () => [...teamKeys.all, "members"] as const,
  invitations: () => [...teamKeys.all, "invitations"] as const,
};

export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: teamsApi.getMembers,
    staleTime: 2 * 60 * 1000,
  });
}

export function useTeamInvitations() {
  return useQuery({
    queryKey: teamKeys.invitations(),
    queryFn: teamsApi.getInvitations,
    staleTime: 2 * 60 * 1000,
  });
}

export function useInviteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: InviteMemberDto) => teamsApi.invite(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.invitations() });
      toast.success("Invitation sent.");
    },
    onError: (e: any) =>
      toast.error(e.message ?? "Failed to send invitation."),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamsApi.removeMember(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.members() });
      toast.success("Team member removed.");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to remove member."),
  });
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMemberDto }) =>
      teamsApi.updateMember(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.members() });
      toast.success("Member updated.");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to update member."),
  });
}
