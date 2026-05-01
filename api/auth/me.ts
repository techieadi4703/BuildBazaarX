import { clearAuthCookies, getSessionFromCookies, setAuthCookies, type ApiRequest, type ApiResponse } from "../_lib/auth";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { session, refreshed } = await getSessionFromCookies(req);

  if (!session) {
    clearAuthCookies(res);
    res.status(200).json({ user: null, accessToken: null });
    return;
  }

  if (refreshed) {
    setAuthCookies(res, session.access_token, session.refresh_token);
  }

  // Return accessToken so the browser-side Supabase client can set it
  // for authenticated (RLS-authorized) data queries.
  res.status(200).json({
    user: session.user,
    accessToken: session.access_token,
    refreshToken: session.refresh_token ?? null,
  });
}
