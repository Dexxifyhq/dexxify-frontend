import { get, post, patch, del } from "@/lib/api-client";

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "owner" | "admin" | "staff";
  status: "active" | "pending" | "suspended";
  permissions: string[];
  joined_at: string | null;
  created_at: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  invite_expires_at: string | null;
  created_at: string;
}

export interface InviteMemberDto {
  email: string;
  role: "admin" | "staff";
  permissions?: string[];
}

export interface UpdateMemberDto {
  role?: "owner" | "admin" | "staff";
  status?: "active" | "pending" | "suspended";
  permissions?: string[];
}

export interface AcceptInviteDto {
  token: string;
  first_name: string;
  last_name: string;
  password: string;
}

export const teamsApi = {
  getMembers: (): Promise<TeamMember[]> =>
    get<{ data: TeamMember[] }>("/teams/members").then((r) => r.data ?? []),
  getInvitations: (): Promise<TeamInvitation[]> =>
    get<{ data: TeamInvitation[] }>("/teams/invitations").then((r) => r.data ?? []),
  invite: (dto: InviteMemberDto) => post<any>("/teams/invite", dto),
  updateMember: (id: string, dto: UpdateMemberDto) =>
    patch<any>(`/teams/members/${id}`, dto),
  removeMember: (id: string) =>
    del<{ removed: boolean; id: string }>(`/teams/members/${id}`),
  acceptInvite: (dto: AcceptInviteDto) =>
    post<{ message: string }>("/teams/accept", dto),
};
