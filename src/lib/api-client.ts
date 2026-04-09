const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://docs.dexxify.com/api/v1";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number | null;
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("dexxify_token") : null;

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (!res.ok) {
      const err = json as { message?: string | string[] };
      const message = Array.isArray(err?.message)
        ? err.message[0]
        : err?.message ?? "Something went wrong";
      return { data: null, error: message, status: res.status };
    }

    return { data: json as T, error: null, status: res.status };
  } catch {
    return { data: null, error: "Network error. Please try again.", status: null };
  }
}
