import type { User } from "@supabase/supabase-js";

const AUTH_EVENT = "bbx-auth-changed";

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Authentication request failed.");
  }
  return payload as T;
}

export const authClient = {
  async getCurrentUser() {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    return parseResponse<{
      user: User | null;
      accessToken: string | null;
      refreshToken: string | null;
    }>(response);
  },

  async signInWithPassword(email: string, password: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await parseResponse<{ user: User }>(response);
    window.dispatchEvent(new Event(AUTH_EVENT));
    return result;
  },

  async signUp(payload: {
    email: string;
    password: string;
    options?: Record<string, unknown>;
  }) {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await parseResponse<{ user: User | null }>(response);
    window.dispatchEvent(new Event(AUTH_EVENT));
    return result;
  },

  async signOut() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    await parseResponse<{ success: boolean }>(response);
    window.dispatchEvent(new Event(AUTH_EVENT));
  },

  onChange(callback: () => void) {
    window.addEventListener(AUTH_EVENT, callback);
    return () => window.removeEventListener(AUTH_EVENT, callback);
  },
};
