import { createServerSupabaseClient, setAuthCookies, clearAuthCookies, type ApiRequest, type ApiResponse } from "../_lib/auth";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email, password, options } = (req.body || {}) as {
    email?: string;
    password?: string;
    options?: Record<string, unknown>;
  };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options });

  if (error) {
    clearAuthCookies(res);
    res.status(400).json({ error: error.message });
    return;
  }

  if (data.session) {
    setAuthCookies(res, data.session.access_token, data.session.refresh_token);
  } else {
    clearAuthCookies(res);
  }

  res.status(200).json({
    user: data.user,
  });
}
