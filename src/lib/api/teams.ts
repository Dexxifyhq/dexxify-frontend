import { get, post, patch, del } from "@/lib/api-client";

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "owner" | "admin" | "staff";
  status: "active" | "pending" | "suspended";
  joined_at: string | null;
  created_at: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  invite_expires_at: string | null;
  created_at: string;
}

export interface InviteMemberDto {
  email: string;
  role: "admin" | "staff";
}

export interface UpdateMemberDto {
  role?: "owner" | "admin" | "staff";
  status?: "active" | "pending" | "suspended";
}

export interface AcceptInviteDto {
  token: string;
  first_name: string;
  last_name: string;
  password: string;
}

export const teamsApi = {
  getMembers: (): Promise<TeamMember[]> => get<TeamMember[]>("/teams/members"),
  getInvitations: (): Promise<TeamInvitation[]> =>
    get<TeamInvitation[]>("/teams/invitations"),
  invite: (dto: InviteMemberDto) => post("/teams/invite", dto),
  updateMember: (id: string, dto: UpdateMemberDto) =>
    patch(`/teams/members/${id}`, dto),
  removeMember: (id: string) =>
    del<{ removed: boolean; id: string }>(`/teams/members/${id}`),
  acceptInvite: (dto: AcceptInviteDto) =>
    post<{ message: string }>("/teams/accept", dto),
};
