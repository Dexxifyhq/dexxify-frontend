import { get, post } from "./api-client";

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

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  new_password: string;
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

// ── API calls (throw ApiError on failure) ──────────────────────────────────

export const authApi = {
  register: (payload: RegisterPayload) =>
    post<{ message: string }>("/auth/register", payload),

  login: (payload: LoginPayload) =>
    post<AuthTokens>("/auth/login", payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    post<{ message: string }>("/auth/verify-otp", payload),

  resendOtp: (payload: ResendOtpPayload) =>
    post<{ message: string }>("/auth/resend-otp", payload),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    post<{ message: string }>("/auth/forgot-password", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    post<{ message: string }>("/auth/reset-password", payload),

  logout: () =>
    post<{ message: string }>("/auth/logout"),

  getProfile: () =>
    get<UserProfile>("/auth/profile"),
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
