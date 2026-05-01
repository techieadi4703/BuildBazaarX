import { clearAuthCookies, createServerSupabaseClient, readAuthCookies, type ApiRequest, type ApiResponse } from "../_lib/auth";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { accessToken, refreshToken } = readAuthCookies(req);

  if (accessToken && refreshToken) {
    const supabase = createServerSupabaseClient();
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    await supabase.auth.signOut();
  }

  clearAuthCookies(res);
  res.status(200).json({ success: true });
}
