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

  const fetchUserRole = async (user: User) => {
    try {
      // 0. Check user metadata first (instant, no DB call)
      if (user.user_metadata?.role) {
        console.log("Role found in metadata:", user.user_metadata.role);
        return user.user_metadata.role;
      }

      const userId = user.id;
      // Add a timeout to ensure auth doesn't hang forever
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("Role fetch timeout")), 5000)
      );

      const fetchPromise = (async () => {
        // 1. Check profiles table first (it's the source of truth for most)
        const { data: profileData } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
        
        if (profileData?.role) {
          console.log("Role found in profile:", profileData.role);
          return profileData.role;
        }

        // 2. Fallback to checking other tables in parallel only if profile role is missing
        console.log("Role missing in profile, checking specialized tables...");
        const [designerRes, professionalRes, supplierRes] = await Promise.all([
          supabase.from('designers').select('id').eq('id', userId).maybeSingle(),
          supabase.from('professionals').select('id').eq('id', userId).maybeSingle(),
          supabase.from('suppliers').select('id').eq('id', userId).maybeSingle()
        ]);

        if (designerRes.data) return 'designer';
        if (professionalRes.data) return 'professional';
        if (supplierRes.data) return 'supplier';
        
        return 'customer';
      })();

      return await Promise.race([fetchPromise, timeoutPromise]) as string;
    } catch (err) {
      console.error("fetchUserRole failed or timed out:", err);
      return 'customer'; // Safe fallback to allow app to load
    }
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
             const role = await fetchUserRole(session.user);
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
            const role = await fetchUserRole(session.user);
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
