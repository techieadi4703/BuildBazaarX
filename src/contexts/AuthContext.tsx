import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { trackEvent, identifyUser } from "@/lib/umami";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userId: string | null;
  roles: string[];
  hasRole: (role: string) => boolean;
  refreshRoles: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase.rpc('my_roles');
      if (error) throw error;
      return (data as string[]) ?? [];
    } catch (err) {
      logger.error('fetchRoles failed:', err);
      return [];
    }
  };

  const hasRole = (role: string) => roles.includes(role);

  const refreshRoles = async () => setRoles(await fetchRoles());

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
             const userRoles = await fetchRoles();
             if (mounted) {
               setRoles(userRoles);
               identifyUser({ userId: session.user.id, roles: userRoles });
             }
          } else {
             if (mounted) {
               setRoles([]);
               identifyUser({});
             }
          }
        }
      } catch (error) {
        logger.error("Error getting session:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        // Resolve loading right away — never block it on the role fetch below.
        setIsLoading(false);

        // CRITICAL: do NOT `await` any Supabase call directly inside this callback.
        // supabase-js invokes it while holding its internal auth lock, and my_roles()
        // needs that same lock to attach the access token → deadlock, leaving the app
        // hung on a blank screen for every logged-in user. Defer with setTimeout(0) so
        // this callback returns and releases the lock before we call the RPC.
        setTimeout(async () => {
          if (!mounted) return;
          if (session?.user) {
            const userRoles = await fetchRoles();
            if (!mounted) return;
            setRoles(userRoles);
            identifyUser({ userId: session.user.id, roles: userRoles });

            if (_event === 'SIGNED_IN') {
              const isSignup = new Date(session.user.created_at).getTime() > Date.now() - 10000;
              trackEvent(isSignup ? "signup" : "login", { roles: userRoles });
            }
          } else {
            setRoles([]);
            identifyUser({});
          }
        }, 0);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    userId: user?.id ?? null,
    roles,
    hasRole,
    refreshRoles,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
