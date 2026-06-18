import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Mail, Lock, User, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const isLoginParam = searchParams.get("mode") === "login";
  const [isLogin, setIsLogin] = useState(isLoginParam);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Role-based redirect
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile?.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
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
        if (error) throw error;
        if (data.user) {
          await supabase
            .from("profiles")
            .update({
              role: "customer",
              full_name: fullName,
            })
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
                  {!isLogin && (
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
                    {isLoading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-6 md:mt-12 pt-6 md:pt-8 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)]">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </span>
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-warm)] hover:underline underline-offset-4"
                  >
                    {isLogin ? "Sign Up" : "Log In"}
                  </button>
                </div>
              </motion.div>
            </div>

          </div>
        </main>
      </div>
    </Layout>
  );
}
