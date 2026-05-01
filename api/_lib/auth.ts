import { createClient, type User } from "@supabase/supabase-js";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const LEGACY_COOKIES = ["bbx-access-token", "bbx-refresh-token"];
const SESSION_TTL = 60 * 60 * 24 * 7;

type CookieMap = Record<string, string | undefined>;

export type ApiRequest = {
  method?: string;
  body?: unknown;
  cookies?: CookieMap;
  headers?: {
    cookie?: string;
  };
  user?: User;
};

export type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
};

type SessionResult =
  | {
      session: {
        access_token: string;
        refresh_token?: string | null;
        expires_at?: number | null;
        user: User;
      };
      refreshed: boolean;
    }
  | {
      session: null;
      refreshed: false;
    };

const getSupabaseEnv = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured for server auth.");
  }

  return { supabaseUrl, supabaseKey };
};

export const createServerSupabaseClient = () => {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv();

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

const serializeCookie = (name: string, value: string, maxAge: number) =>
  [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    `Max-Age=${maxAge}`,
  ].join("; ");

const parseCookieHeader = (cookieHeader?: string) => {
  const cookies: CookieMap = {};

  for (const rawCookie of (cookieHeader || "").split(";")) {
    const [name, ...rest] = rawCookie.trim().split("=");
    if (!name) continue;
    cookies[name] = decodeURIComponent(rest.join("="));
  }

  return cookies;
};

export const readAuthCookies = (req: Pick<ApiRequest, "cookies" | "headers">) => {
  const cookies = req.cookies || parseCookieHeader(req.headers?.cookie);

  return {
    accessToken: cookies[ACCESS_COOKIE] || null,
    refreshToken: cookies[REFRESH_COOKIE] || null,
  };
};

export const setAuthCookies = (res: Pick<ApiResponse, "setHeader">, accessToken: string, refreshToken?: string | null) => {
  const cookies = [
    serializeCookie(ACCESS_COOKIE, accessToken, SESSION_TTL),
    ...LEGACY_COOKIES.map((name) => serializeCookie(name, "", 0)),
  ];

  if (refreshToken) {
    cookies.push(serializeCookie(REFRESH_COOKIE, refreshToken, SESSION_TTL));
  } else {
    cookies.push(serializeCookie(REFRESH_COOKIE, "", 0));
  }

  res.setHeader("Set-Cookie", cookies);
};

export const clearAuthCookies = (res: Pick<ApiResponse, "setHeader">) => {
  res.setHeader("Set-Cookie", [
    serializeCookie(ACCESS_COOKIE, "", 0),
    serializeCookie(REFRESH_COOKIE, "", 0),
    ...LEGACY_COOKIES.map((name) => serializeCookie(name, "", 0)),
  ]);
};

export const getSessionFromCookies = async (req: Pick<ApiRequest, "cookies" | "headers">): Promise<SessionResult> => {
  const supabase = createServerSupabaseClient();
  const { accessToken, refreshToken } = readAuthCookies(req);

  if (!accessToken && !refreshToken) {
    return { session: null, refreshed: false };
  }

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) {
      return {
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: data.user,
        },
        refreshed: false,
      };
    }
  }

  if (!refreshToken) {
    return { session: null, refreshed: false };
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return { session: null, refreshed: false };
  }

  return { session: data.session, refreshed: true };
};

export const requireAuth = async (req: ApiRequest, res: ApiResponse) => {
  const { session, refreshed } = await getSessionFromCookies(req);

  if (!session) {
    clearAuthCookies(res);
    res.status(401).json({ error: "Not authenticated." });
    return null;
  }

  if (refreshed) {
    setAuthCookies(res, session.access_token, session.refresh_token);
  }

  req.user = session.user;
  return session.user;
};
