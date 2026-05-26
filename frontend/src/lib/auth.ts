/**
 * Thin client-side auth helpers.
 * Stores the JWT in localStorage (convenient for SPAs;
 * swap to httpOnly cookies via a Next.js middleware layer before production).
 */

const TOKEN_KEY = "mm_token";
const USER_KEY  = "mm_user";

export interface StoredUser {
  id: string;
  username: string;
  email: string;
}

export function setSession(token: string, user: StoredUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as StoredUser; }
  catch { return null; }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
