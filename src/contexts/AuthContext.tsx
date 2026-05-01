import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

type UserRole = 'customer' | 'designer' | 'professional' | 'supplier' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userId: string | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserRole = async (userId: string) => {
      try {
        // Parallel checks for maximum performance
        const [designer, professional, supplier] = await Promise.all([
          supabase.from('designers').select('id').eq('id', userId).maybeSingle(),
          supabase.from('professionals').select('id').eq('id', userId).maybeSingle(),
          supabase.from('suppliers').select('id').eq('id', userId).maybeSingle()
        ]);

        let role: UserRole = 'customer';
        if (designer.data) role = 'designer';
        else if (professional.data) role = 'professional';
        else if (supplier.data) role = 'supplier';

        if (mounted) setUserRole(role);
      } catch (err) {
        logger.error("Role resolution error:", err);
        if (mounted) setUserRole('customer');
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await fetchUserRole(currentUser.id);
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
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await fetchUserRole(currentUser.id);
          } else {
            setUserRole(null);
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
