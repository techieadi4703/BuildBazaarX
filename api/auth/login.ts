import { createServerSupabaseClient, setAuthCookies, clearAuthCookies, type ApiRequest, type ApiResponse } from "../_lib/auth";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email, password } = (req.body || {}) as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    clearAuthCookies(res);
    res.status(401).json({ error: error?.message || "Invalid credentials." });
    return;
  }

  setAuthCookies(res, data.session.access_token, data.session.refresh_token);
  res.status(200).json({ user: data.user });
}
