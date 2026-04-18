import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://docs.dexxify.com/api/v1";

export class ApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach Bearer token ───────────────────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dexxify_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: 401 → refresh → retry ───────────────────────────────────────

type PendingRequest = { resolve: (token: string) => void; reject: (err: unknown) => void };

let isRefreshing = false;
let queue: PendingRequest[] = [];

function flushQueue(err: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) => (token ? resolve(token) : reject(err)));
  queue = [];
}

function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("dexxify_token");
  localStorage.removeItem("dexxify_refresh_token");
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

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

    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("dexxify_refresh_token")
        : null;

    if (!refreshToken) {
      clearTokens();
      isRefreshing = false;
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      localStorage.setItem("dexxify_token", data.access_token);
      if (data.refresh_token)
        localStorage.setItem("dexxify_refresh_token", data.refresh_token);
      flushQueue(null, data.access_token);
      if (original.headers)
        original.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(original);
    } catch (refreshErr) {
      flushQueue(refreshErr, null);
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
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
  const message = Array.isArray(msg) ? msg[0] : (msg ?? "Something went wrong");
  return new ApiError(message, e.response?.status ?? null);
}

// ── Typed HTTP wrappers (throw ApiError on failure) ────────────────────────

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
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
