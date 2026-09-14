/**
 * Public axios client — no auth cookies.
 * Used for customer-facing pages like /pay/[session_id]
 * that must be accessible without a merchant session.
 */
import axios from "axios";
import { API_BASE } from "./api-client";

export class PublicApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.name = "PublicApiError";
    this.status = status;
  }
}

export const publicClient = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

function toError(err: unknown): PublicApiError {
  const e = err as any;
  const msg = e.response?.data?.message;
  const message = Array.isArray(msg) ? msg[0] : (msg ?? "Something went wrong");
  return new PublicApiError(message, e.response?.status ?? null);
}

export async function publicGet<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    const res = await publicClient.get(url, { params });
    return unwrap<T>(res.data);
  } catch (err) {
    throw toError(err);
  }
}

export async function publicPost<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await publicClient.post(url, body);
    return unwrap<T>(res.data);
  } catch (err) {
    throw toError(err);
  }
}
