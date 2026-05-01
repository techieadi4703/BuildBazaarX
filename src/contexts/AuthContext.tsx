import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { authClient } from "@/lib/auth-client";

interface AuthContextType {
  user: User | null;
  userId: string | null;
  userRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    // Run checks in parallel
    const [profileRes, designerRes, professionalRes, supplierRes] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
      supabase.from('designers').select('id').eq('id', userId).maybeSingle(),
      supabase.from('professionals').select('id').eq('id', userId).maybeSingle(),
      supabase.from('suppliers').select('id').eq('id', userId).maybeSingle()
    ]);

    if (profileRes.data?.role === 'designer' || designerRes.data) return 'designer';
    if (profileRes.data?.role === 'professional' || professionalRes.data) return 'professional';
    if (profileRes.data?.role === 'supplier' || supplierRes.data) return 'supplier';
    return 'customer'; // Default role
  };

  const applySession = async (
    sessionUser: User | null,
    accessToken: string | null,
    refreshToken: string | null
  ) => {
    // Set the session on the Supabase data client so RLS policies work
    if (sessionUser && accessToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken ?? "",
      });
    } else {
      // Clear session on the data client
      await supabase.auth.signOut({ scope: "local" });
    }
    setUser(sessionUser);
  };

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      try {
        const { user, accessToken, refreshToken } = await authClient.getCurrentUser();
        if (mounted) {
          await applySession(user, accessToken, refreshToken);
          if (user) {
            const role = await fetchUserRole(user.id);
            if (mounted) setUserRole(role);
          } else {
            if (mounted) setUserRole(null);
          }
        }
      } catch (error) {
        logger.error("Error getting current user:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    syncSession();
    const unsubscribe = authClient.onChange(() => {
      void syncSession();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const refreshSession = async () => {
    const { user, accessToken, refreshToken } = await authClient.getCurrentUser();
    await applySession(user, accessToken, refreshToken);
    if (user) {
      setUserRole(await fetchUserRole(user.id));
    } else {
      setUserRole(null);
    }
  };

  const signOut = async () => {
    await authClient.signOut();
    await supabase.auth.signOut({ scope: "local" });
    setUser(null);
    setUserRole(null);
  };

  const value = {
    user,
    userId: user?.id ?? null,
    userRole,
    isAuthenticated: !!user,
    isLoading,
    refreshSession,
    signOut,
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
