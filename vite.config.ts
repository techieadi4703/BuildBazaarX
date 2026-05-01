import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { createClient } from "@supabase/supabase-js";

const devAuthApiPlugin = (env: Record<string, string>) => ({
  name: "dev-auth-api",
  configureServer(server: import("vite").ViteDevServer) {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url ? req.url.split("?")[0] : "";
      const handledRoutes = new Set([
        "/api/auth/login",
        "/api/auth/logout",
        "/api/auth/me",
        "/api/auth/signup",
      ]);

      if (!handledRoutes.has(url)) {
        next();
        return;
      }

      try {
        const body = await new Promise<unknown>((resolve, reject) => {
          if (req.method === "GET" || req.method === "HEAD") {
            resolve(undefined);
            return;
          }

          let raw = "";
          req.on("data", (chunk) => {
            raw += chunk;
          });
          req.on("end", () => {
            if (!raw) {
              resolve(undefined);
              return;
            }

            try {
              resolve(JSON.parse(raw));
            } catch (error) {
              reject(error);
            }
          });
          req.on("error", reject);
        });

        res.status = (code: number) => {
          res.statusCode = code;
          return res as typeof res & { json: (payload: unknown) => void };
        };
        (res as typeof res & { json: (payload: unknown) => void }).json = (payload: unknown) => {
          if (!res.getHeader("Content-Type")) {
            res.setHeader("Content-Type", "application/json");
          }
          res.end(JSON.stringify(payload));
        };

        const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
        const supabaseKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
          res.status(500).json({ error: "Supabase environment variables are not configured for server auth." });
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        });

        const readCookies = () => {
          const cookies = new Map<string, string>();
          for (const rawCookie of (req.headers.cookie || "").split(";")) {
            const [name, ...rest] = rawCookie.trim().split("=");
            if (!name) continue;
            cookies.set(name, decodeURIComponent(rest.join("=")));
          }
          return {
            accessToken: cookies.get("accessToken") || null,
            refreshToken: cookies.get("refreshToken") || null,
          };
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

        const clearCookieNames = ["accessToken", "refreshToken", "bbx-access-token", "bbx-refresh-token"];

        const setAuthCookies = (accessToken: string, refreshToken?: string | null) => {
          res.setHeader("Set-Cookie", [
            serializeCookie("accessToken", accessToken, 60 * 60 * 24 * 7),
            refreshToken
              ? serializeCookie("refreshToken", refreshToken, 60 * 60 * 24 * 7)
              : serializeCookie("refreshToken", "", 0),
            serializeCookie("bbx-access-token", "", 0),
            serializeCookie("bbx-refresh-token", "", 0),
          ]);
        };

        const clearAuthCookies = () => {
          res.setHeader("Set-Cookie", clearCookieNames.map((name) => serializeCookie(name, "", 0)));
        };

        if (url === "/api/auth/login") {
          if (req.method !== "POST") {
            res.status(405).json({ error: "Method not allowed" });
            return;
          }
          const payload = body as { email?: string; password?: string } | undefined;
          if (!payload?.email || !payload?.password) {
            res.status(400).json({ error: "Email and password are required." });
            return;
          }

          const { data, error } = await supabase.auth.signInWithPassword(payload);
          if (error || !data.session) {
            clearAuthCookies();
            res.status(401).json({ error: error?.message || "Invalid credentials." });
            return;
          }

          setAuthCookies(data.session.access_token, data.session.refresh_token);
          res.status(200).json({ user: data.user });
          return;
        }

        if (url === "/api/auth/signup") {
          if (req.method !== "POST") {
            res.status(405).json({ error: "Method not allowed" });
            return;
          }
          const payload = body as {
            email?: string;
            password?: string;
            options?: Record<string, unknown>;
          } | undefined;

          if (!payload?.email || !payload?.password) {
            res.status(400).json({ error: "Email and password are required." });
            return;
          }

          const { data, error } = await supabase.auth.signUp(payload);
          if (error) {
            clearAuthCookies();
            res.status(400).json({ error: error.message });
            return;
          }

          if (data.session) {
            setAuthCookies(data.session.access_token, data.session.refresh_token);
          } else {
            clearAuthCookies();
          }

          res.status(200).json({ user: data.user });
          return;
        }

        if (url === "/api/auth/logout") {
          if (req.method !== "POST") {
            res.status(405).json({ error: "Method not allowed" });
            return;
          }

          const { accessToken, refreshToken } = readCookies();
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            await supabase.auth.signOut();
          }

          clearAuthCookies();
          res.status(200).json({ success: true });
          return;
        }

        if (url === "/api/auth/me") {
          if (req.method !== "GET") {
            res.status(405).json({ error: "Method not allowed" });
            return;
          }

          const { accessToken, refreshToken } = readCookies();
          if (!accessToken && !refreshToken) {
            clearAuthCookies();
            res.status(200).json({ user: null });
            return;
          }

          if (accessToken) {
            const { data, error } = await supabase.auth.getUser(accessToken);
            if (!error && data.user) {
              res.status(200).json({
                user: data.user,
                accessToken,
                refreshToken: refreshToken ?? null,
              });
              return;
            }
          }

          if (!refreshToken) {
            clearAuthCookies();
            res.status(200).json({ user: null });
            return;
          }

          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
          });

          if (error || !data.session) {
            clearAuthCookies();
            res.status(200).json({ user: null, accessToken: null });
            return;
          }

          setAuthCookies(data.session.access_token, data.session.refresh_token);
          res.status(200).json({
            user: data.session.user,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token ?? null,
          });
        }
      } catch (error) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Unexpected auth middleware failure.",
          }),
        );
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mode === "development" && devAuthApiPlugin(env)].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', 'recharts', 'embla-carousel-react'],
        }
      }
    }
  }
  });
});
