import axios, { AxiosError } from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://docs.dexxify.com/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach Bearer token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dexxify_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Typed wrapper ──────────────────────────────────────────────────────────

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number | null;
}

export async function apiRequest<T>(
  path: string,
  options?: { method?: string; body?: unknown }
): Promise<ApiResponse<T>> {
  try {
    const res = await apiClient.request<T>({
      url: path,
      method: options?.method ?? "GET",
      data: options?.body,
    });
    return { data: res.data, error: null, status: res.status };
  } catch (err) {
    const e = err as AxiosError<{ message?: string | string[] }>;
    const msg = e.response?.data?.message;
    const message = Array.isArray(msg) ? msg[0] : msg ?? "Something went wrong";
    return { data: null, error: message, status: e.response?.status ?? null };
  }
}
