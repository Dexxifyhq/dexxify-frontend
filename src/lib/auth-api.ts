import axios, { AxiosError } from "axios";
import { apiClient, get, post, ApiError } from "./api-client";
import { setMemoryToken, clearMemoryToken, getMemoryToken } from "./api-client";

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
  /**
   * Login is routed through the Next.js session handler (/api/auth/session)
   * instead of calling the backend directly. The handler sets the httpOnly
   * refresh token cookie and returns only the short-lived access token.
   */
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    try {
      const { data } = await axios.post<AuthTokens>("/api/auth/session", payload);
      return data;
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
   * 1. Tell the backend to invalidate the access/refresh token server-side
   *    (POST /api/v1/auth/logout — Authorization header is added automatically
   *    by the Axios interceptor via the in-memory access token)
   * 2. Clear the httpOnly session + refresh-token cookies via the Next.js route
   * 3. Clear the in-memory access token
   */
  logout: async () => {
    await post<{ message: string }>("/auth/logout").catch(() => null);
    await axios.post("/api/auth/logout").catch(() => null);
    clearMemoryToken();
  },

  // _noAutoLogout: true — a 401 here shows "Unknown User", it does NOT log
  // the user out. Session validity is enforced by proxy.ts, not this call.
  getProfile: () =>
    apiClient
      .get<UserProfile>("/auth/profile", { _noAutoLogout: true })
      .then((r) => r.data),
};

// ── Token helpers ──────────────────────────────────────────────────────────

/**
 * Called after a successful login. Stores the access token in memory only —
 * never in localStorage or a readable cookie.
 */
export function saveTokens(tokens: AuthTokens) {
  setMemoryToken(tokens.access_token);
}

/**
 * Clears the in-memory access token and invalidates the server-side session.
 */
export function clearTokens() {
  clearMemoryToken();
}

/**
 * Returns the current in-memory access token, or null if not set.
 * Returns null on the server (SSR) since memory is per-request there.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return getMemoryToken();
}
