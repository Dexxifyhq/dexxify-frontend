import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

// Extend Axios config to support per-request opt-out of the auto-logout
declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _noAutoLogout?: boolean; // set true on non-critical calls (e.g. profile)
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://docs.dexxify.com/api/v1";

// ── In-memory token store ──────────────────────────────────────────────────
// The access token lives here only — never in localStorage or a readable
// cookie. On page refresh it is empty until the first 401 triggers a silent
// refresh via /api/auth/refresh (which reads the httpOnly refresh token).

let _accessToken: string | null = null;

export function setMemoryToken(token: string) {
  _accessToken = token;
}

export function clearMemoryToken() {
  _accessToken = null;
}

export function getMemoryToken(): string | null {
  return _accessToken;
}

// ── Error class ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ── Axios instance ─────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach Bearer token from memory ───────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ── Response: 401 → silent refresh via Next.js route → retry ──────────────
// The refresh call goes to /api/auth/refresh (a Next.js route handler) which
// reads the httpOnly __dexxify_rt cookie — JS never sees the refresh token.

type PendingRequest = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let queue: PendingRequest[] = [];

function flushQueue(err: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(err)
  );
  queue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Queue concurrent 401s while a refresh is in-flight
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        if (original.headers) original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Call the Next.js route — it reads __dexxify_rt (httpOnly) internally
      const { data } = await axios.post<{ access_token: string }>(
        "/api/auth/refresh"
      );

      setMemoryToken(data.access_token);
      flushQueue(null, data.access_token);

      if (original.headers) {
        original.headers.Authorization = `Bearer ${data.access_token}`;
      }
      return apiClient(original);
    } catch (refreshErr) {
      flushQueue(refreshErr, null);
      clearMemoryToken();
      // Only force-logout if the failed request was a session-critical call.
      // Non-critical calls (e.g. profile) set _noAutoLogout: true so a 401
      // shows an empty state rather than kicking the user to /login.
      if (typeof window !== "undefined" && !original._noAutoLogout) {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
        setTimeout(() => { window.location.href = "/login"; }, 0);
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

// ── Error extractor ────────────────────────────────────────────────────────

function toApiError(err: unknown): ApiError {
  const e = err as AxiosError<{ message?: string | string[] }>;
  const msg = e.response?.data?.message;
  const message = Array.isArray(msg)
    ? msg[0]
    : (msg ?? "Something went wrong");
  return new ApiError(message, e.response?.status ?? null);
}

// ── Typed HTTP wrappers (throw ApiError on failure) ────────────────────────

export async function get<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> {
  try {
    const res = await apiClient.get<T>(url, { params });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await apiClient.post<T>(url, body);
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await apiClient.patch<T>(url, body);
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await apiClient.put<T>(url, body);
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function del<T>(url: string): Promise<T> {
  try {
    const res = await apiClient.delete<T>(url);
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}
