import axios, { AxiosError } from "axios";
import { apiClient, get, post, ApiError } from "./api-client";

// ── Types ──────────────────────────────────────────────────────────────────

// Generic API response wrapper from backend
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

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

export interface UserProfile {
  id: string;
  email: string;
  business_name: string;
  business_type: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  plan: string;
  api_call_count: number;
  monthly_api_limit: number;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── API calls ──────────────────────────────────────────────────────────────

export const authApi = {
  login: async (payload: LoginPayload) => {
    return post<ApiResponse<any>>("/auth/login", payload);
    // try {
    //   // const { data } = await axios.post('/auth/login', payload);
    //   // return data;
    // } catch (err) {
    //   // Extract the backend's error message from the response body and
    //   // re-throw as ApiError so the login form can display it correctly.
    //   const e = err as AxiosError<{ message?: string | string[] }>;
    //   const raw = e.response?.data?.message;
    //   const message = Array.isArray(raw)
    //     ? raw[0]
    //     : (raw ?? "Invalid email or password.");
    //   throw new ApiError(message, e.response?.status ?? null);
    // }
  },

  register: (payload: RegisterPayload) =>
    post<ApiResponse<any>>("/auth/register", payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    post<ApiResponse<any>>("/auth/verify-otp", payload),

  resendOtp: (payload: ResendOtpPayload) =>
    post<ApiResponse<any>>("/auth/resend-otp", payload),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    post<ApiResponse<any>>("/auth/forgot-password", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    post<ApiResponse<any>>("/auth/reset-password", payload),

  /**
   * Full logout:
   */
  logout: async () => {
    return post<ApiResponse<any>>("/auth/logout");
    // console.log(data);
  },

  getProfile: () => get<ApiResponse<UserProfile>>("/auth/profile"),
};
