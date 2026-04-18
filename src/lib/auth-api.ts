import axios, { AxiosError } from "axios";
import { apiClient, get, post, ApiError } from "./api-client";

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

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  business_type?: string;
  phone?: string;
  role?: string;
}

// ── API calls ──────────────────────────────────────────────────────────────

export const authApi = {
  login: async (payload: LoginPayload) => {
    try {
      return post<{ message: string }>("/auth/login", payload);
      // const { data } = await axios.post('/auth/login', payload);
      // return data;
    } catch (err) {
      // Extract the backend's error message from the response body and
      // re-throw as ApiError so the login form can display it correctly.
      const e = err as AxiosError<{ message?: string | string[] }>;
      const raw = e.response?.data?.message;
      const message = Array.isArray(raw)
        ? raw[0]
        : (raw ?? "Invalid email or password.");
      throw new ApiError(message, e.response?.status ?? null);
    }
  },

  register: (payload: RegisterPayload) =>
    post<{ message: string }>("/auth/register", payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    post<{ message: string }>("/auth/verify-otp", payload),

  resendOtp: (payload: ResendOtpPayload) =>
    post<{ message: string }>("/auth/resend-otp", payload),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    post<{ message: string }>("/auth/forgot-password", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    post<{ message: string }>("/auth/reset-password", payload),

  /**
   * Full logout:
   */
  logout: async () => {
    await post<{ message: string }>("/auth/logout").catch(() => null);
  },

  getProfile: () => get<any>("/auth/profile"),
  // apiClient.get<UserProfile>('/auth/profile').then((r) => r.data),
};
