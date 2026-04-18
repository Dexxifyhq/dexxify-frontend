import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// Extend AxiosRequestConfig to include _retry flag
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// export const API_BASE = "http://localhost:4000/api/v1";
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://docs.dexxify.com/api/v1";

// ── Error class ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Define proper type for the queue
interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

// ── Axios instance ─────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Sends httpOnly cookies automatically
});

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

/**
 * Response Interceptor
 * Automatically refreshes access token when it expires (401 error)
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    console.log("API Response error", error);

    // If no config, reject immediately
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - Access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints to prevent infinite loops
      if (
        originalRequest.url?.includes("/login") ||
        originalRequest.url?.includes("/register")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          {
            withCredentials: true, // Sends refreshToken cookie
          },
        );

        // console.log(response.data.data);

        // Server will set new access_token cookie
        processQueue(null); // Tell waiting requests to retry

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        processQueue(new Error("Token refresh failed")); // Reject all waiting requests
        // console.error("refreshError", refreshError);

        if (typeof window !== "undefined") {
          // Clear local storage items
          localStorage.clear();

          // Redirect to login
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    return Promise.reject(error);
  },
);

// ── Error extractor ────────────────────────────────────────────────────────

function toApiError(err: unknown): ApiError {
  const e = err as AxiosError<{ message?: string | string[] }>;
  const msg = e.response?.data?.message;
  const message = Array.isArray(msg) ? msg[0] : (msg ?? "Something went wrong");
  return new ApiError(message, e.response?.status ?? null);
}

// ── Typed HTTP wrappers (throw ApiError on failure) ────────────────────────

export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
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
