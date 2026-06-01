/**
 * Centralised API client for all backend calls.
 * Base URL is read from NEXT_PUBLIC_API_URL (set in .env.local).
 */

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

// ── Generic fetch wrapper ──────────────────────────────────────────────────

interface ApiOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const json = await res.json() as { success: boolean; message?: string; data?: T };

  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.message ?? "Request failed.");
  }

  return json.data as T;
}

// ── Auth endpoints ─────────────────────────────────────────────────────────

export interface AuthPayload {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const authApi = {
  signup(body: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthPayload> {
    return request<AuthPayload>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login(body: {
    email: string;
    password: string;
  }): Promise<AuthPayload> {
    return request<AuthPayload>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
