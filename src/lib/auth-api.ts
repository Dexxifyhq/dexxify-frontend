import { apiRequest } from "./api-client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  business_name: string;
  business_type?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  business_type?: string;
  phone?: string;
}

// ── API calls ──────────────────────────────────────────────────────────────

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiRequest<{ message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiRequest<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyOtp: (payload: VerifyOtpPayload) =>
    apiRequest<{ message: string }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resendOtp: (payload: ResendOtpPayload) =>
    apiRequest<{ message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest<{ message: string }>("/auth/logout", { method: "POST" }),

  getProfile: () => apiRequest<UserProfile>("/auth/profile"),
};

// ── Token helpers ──────────────────────────────────────────────────────────

export function saveTokens(tokens: AuthTokens) {
  localStorage.setItem("dexxify_token", tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem("dexxify_refresh_token", tokens.refresh_token);
  }
}

export function clearTokens() {
  localStorage.removeItem("dexxify_token");
  localStorage.removeItem("dexxify_refresh_token");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dexxify_token");
}
