import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase, PORTAL_ROLE } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Mail, Lock, User, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const isLoginParam = searchParams.get("mode") === "login";
  const [isLogin, setIsLogin] = useState(isLoginParam);
  // link-existing mode: the email already has a BuildBazaarX account, so instead of
  // signing up we sign in and attach the customer role via grant_self_role.
  const [isLinking, setIsLinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshRoles } = useAuth();

  useEffect(() => {
    setIsLogin(isLoginParam);
  }, [isLoginParam]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Don't navigate here — handleAuth already handles it for login
        // This handles the case of returning authenticated users
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Links the customer role onto an ALREADY-existing BuildBazaarX account: signs in
  // with the entered credentials, attaches 'customer' via grant_self_role (which never
  // overwrites the account's other roles), refreshes context, then continues.
  const linkExistingAccount = async () => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      toast({
        variant: "destructive",
        title: "That email already has a BuildBazaarX account",
        description: "Enter its password to add a customer profile.",
      });
      return;
    }

    const { error: roleError } = await supabase.rpc("grant_self_role", { p_role: PORTAL_ROLE });
    if (roleError) throw roleError;

    await refreshRoles();
    toast({ title: "Customer profile added ✨", description: "You're all set." });
    navigate("/");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLinking) {
        await linkExistingAccount();
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Admin-aware redirect. Admin status comes from user_roles via has_role(),
        // never from profiles.role.
        const { data: isAdmin } = await supabase.rpc("has_role", { p_role: "admin" });
        navigate(isAdmin ? "/admin" : "/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: "customer",
            },
          },
        });
        if (error) {
          // Already have a BuildBazaarX account? Don't dead-end — link a customer
          // profile onto the existing account instead.
          if (/already registered/i.test(error.message) || (error as any).code === "user_already_exists") {
            setIsLinking(true);
            await linkExistingAccount();
            return;
          }
          throw error;
        }
        if (data.user) {
          // Attach the name WITHOUT touching role. Role assignment now happens in the
          // DB trigger (fresh signup) and grant_self_role (linking).
          await supabase
            .from("profiles")
            .update({ full_name: fullName })
            .eq("id", data.user.id);

          toast({ title: "Account Created", description: "Verification email sent." });
          navigate("/");
        }
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        .font-headline { font-family: 'Newsreader', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
      `}</style>
      
      <div className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen font-body w-full pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <main className="max-w-[1440px] w-full mx-auto px-6 md:px-12 py-12 md:py-0 relative z-10 min-h-[calc(100vh-120px)] flex items-center justify-center">
          <div className="flex flex-col md:flex-row gap-8 md:gap-24 items-center justify-center w-full max-w-5xl">
            
            <div className="w-full md:w-1/2 shrink-0">
               <span className="font-body uppercase tracking-[0.2em] text-[10px] text-[var(--accent-warm)] mb-4 block font-bold">Account</span>
               <h1 className="font-display font-semibold text-4xl md:text-5xl leading-[1.1] tracking-tight text-[var(--text-primary)] mb-6">
                Customer {isLogin ? "Login." : "Signup."}
              </h1>
               <div className="w-12 h-[1px] bg-[var(--border-subtle)] mb-6"></div>
              <p className="text-lg font-body text-[var(--text-secondary)] leading-relaxed max-w-sm">
                {isLogin 
                  ? "Log in to your account to access our platform." 
                  : "Create an account to join our platform."}
              </p>
              
              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--accent-warm)]" /> Secure Session
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 max-w-xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 md:p-12 rounded-sm shadow-sm overflow-hidden"
              >
                <form onSubmit={handleAuth} className="space-y-5 md:space-y-8">
                  {isLinking && (
                    <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 rounded-sm">
                      <p className="text-[11px] uppercase font-bold tracking-widest text-[var(--text-secondary)] leading-relaxed">
                        You already have a BuildBazaarX account. Sign in below to add a{" "}
                        <span className="text-[var(--text-primary)]">customer</span> profile — your existing roles stay intact.
                      </p>
                    </div>
                  )}

                  {!isLogin && !isLinking && (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)]">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                        <input 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full pl-12 pr-4 py-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-warm)] rounded-sm text-sm outline-none font-body transition-colors text-[var(--text-primary)]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)]">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-warm)] rounded-sm text-sm outline-none font-body transition-colors text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)]">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-warm)] rounded-sm text-sm outline-none font-body transition-colors text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center gap-3 group"
                  >
                    {isLoading ? "Loading..." : isLinking ? "Add customer profile" : isLogin ? "Log In" : "Sign Up"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-6 md:mt-12 pt-6 md:pt-8 border-t border-[var(--border-subtle)] flex flex-col gap-4">
                  {isLinking ? (
                    <button
                      type="button"
                      onClick={() => setIsLinking(false)}
                      className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-warm)] hover:underline underline-offset-4 self-start"
                    >
                      ← Back to sign up
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)]">
                          {isLogin ? "Don't have an account?" : "Already have an account?"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsLogin(!isLogin)}
                          className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-warm)] hover:underline underline-offset-4"
                        >
                          {isLogin ? "Sign Up" : "Log In"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIsLinking(true); setIsLogin(false); }}
                        className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:underline underline-offset-4 text-left"
                      >
                        Already use BuildBazaarX? Add a customer profile →
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </main>
      </div>
    </Layout>
  );
}
