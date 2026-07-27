import { get, patch, post } from "@/lib/api-client";

export interface Business {
  id: string;
  name: string;
  type: string | null;
  support_email: string | null;
  logo_url: string | null;
  show_branding_on_checkout: boolean;
  website_url: string | null;
  settlement_currency: "NGN" | "USDT" | "USDC";
  default_payout_method: "crypto" | "bank";
  instant_payouts_enabled: boolean;
  notification_preferences: Record<string, boolean>;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateBusinessProfileDto {
  name?: string;
  type?: string;
  support_email?: string;
  logo_url?: string;
  show_branding_on_checkout?: boolean;
  website_url?: string;
}

export interface UpdateSettlementsDto {
  settlement_currency?: "NGN" | "USDT" | "USDC";
  default_payout_method?: "crypto" | "bank";
  instant_payouts_enabled?: boolean;
}

export interface UpdateNotificationsDto {
  preferences?: Record<string, boolean>;
}

export interface BusinessSummary {
  id: string;
  name: string;
  logo_url: string | null;
}

export const businessesApi = {
  getAll: () => get<BusinessSummary[]>("/businesses"),
  getMe: () => get<Business>("/businesses/me"),
  updateProfile: (dto: UpdateBusinessProfileDto) =>
    patch<Business>("/businesses/me", dto),
  updateSettlements: (dto: UpdateSettlementsDto) =>
    patch<Business>("/businesses/me/settlements", dto),
  updateNotifications: (dto: UpdateNotificationsDto) =>
    patch<Business>("/businesses/me/notifications", dto),
  create: (dto: { name: string; type?: string }) =>
    post<Business>("/businesses", dto),
};
