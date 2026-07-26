import { get, patch, post } from "@/lib/api-client";

export interface DeveloperProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  theme_preference: string | null;
  subscription_plan: string | null;
  status: string;
  email_verified_at: string | null;
  last_active_business_id: string | null;
  created_at: string;
}

export interface UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  theme_preference?: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export const developersApi = {
  getMe: () => get<DeveloperProfile>("/developers/me"),
  updateProfile: (dto: UpdateProfileDto) =>
    patch<DeveloperProfile>("/developers/me", dto),
  changePassword: (dto: ChangePasswordDto) =>
    post<{ message: string }>("/developers/me/change-password", dto),
};
