import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userId: string | null;
  userRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
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

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
             const role = await fetchUserRole(session.user.id);
             if (mounted) setUserRole(role);
          } else {
             if (mounted) setUserRole(null);
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
      async (_event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            const role = await fetchUserRole(session.user.id);
            if (mounted) setUserRole(role);
          } else {
            if (mounted) setUserRole(null);
          }
          setIsLoading(false);
        }
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
    userRole,
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
