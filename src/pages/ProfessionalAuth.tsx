import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Mail, Lock, Wrench, ShieldCheck, MapPin, Phone, User, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfessionalAuth() {
  const [searchParams] = useSearchParams();
  const isLoginParam = searchParams.get("mode") === "login";
  const [isLogin, setIsLogin] = useState(isLoginParam);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [profession, setProfession] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const resolveProfessionalDestination = async (userId: string) => {
    const { data: profData, error: profError } = await supabase
      .from("professionals")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profError) throw profError;

    return profData ? "/professional/dashboard" : "/professional/setup";
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) return;

      window.setTimeout(() => {
        resolveProfessionalDestination(session.user.id)
          .then((path) => navigate(path))
          .catch((error) => {
            console.error("Professional auth redirect error:", error);
            navigate("/professional/setup");
          });
      }, 500);
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
        const sessionData = await supabase.auth.getSession();
        const userId = sessionData.data.session?.user.id;
        if (userId) {
          const nextPath = await resolveProfessionalDestination(userId);
          navigate(nextPath);
        } else {
          navigate("/professional/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: "professional",
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Safety Sync: Explicitly update the profiles table to ensure role, contact and location info are attached first
          await supabase.from('profiles').update({ 
            role: 'professional', 
            full_name: fullName,
            phone: phone,
            city: city
          }).eq('id', data.user.id);

          toast({ title: "Identity Synchronized", description: "Proceeding to professional setup..." });
          navigate("/professional/setup");
        }
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Access Denied", description: error.message });
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
      
      <div className="bg-[#fcf9f6] text-[#1c1c1a] min-h-screen font-body w-full pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e2df 1px, transparent 1px), linear-gradient(90deg, #e5e2df 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
        
        <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-start">
            
            <div className="w-full md:w-1/3 shrink-0 sticky top-32">
               <span className="font-body uppercase tracking-[0.2em] text-[10px] text-[#735c00] mb-4 block font-bold">Execution & Trades</span>
               <h1 className="text-6xl md:text-7xl font-headline tracking-tight leading-none mb-6">
                Professional <br/><span className="italic">{isLogin ? "Access." : "Registry."}</span>
              </h1>
               <div className="w-12 h-[1px] bg-[#c4c6cc] mb-6"></div>
              <p className="text-lg font-body text-[#44474c] leading-relaxed max-w-sm">
                {isLogin 
                  ? "Re-authenticate to manage your strategic schedule and verify client commissions." 
                  : "Establish your specialized registry within our verified network of execution professionals."}
              </p>
            </div>

            <div className="w-full md:w-2/3 max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#e5e2df] p-8 md:p-12 rounded-sm shadow-sm"
              >
                <form onSubmit={handleAuth} className="space-y-8">
                  {!isLogin && (
                    <>
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Professional Title / Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4c6cc]" />
                          <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Aditya Srivastava" className="w-full pl-12 pr-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Primary Contact (WhatsApp)</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4c6cc]" />
                          <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 XXXXX" className="w-full pl-12 pr-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Base Operations (City)</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4c6cc]" />
                          <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Jaipur" className="w-full pl-12 pr-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Professional Identity Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4c6cc]" />
                      <input 
                        required 
                        type="email" 
                        autoComplete="off"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="name@provider.com" 
                        className="w-full pl-12 pr-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Security Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4c6cc]" />
                      <input 
                        required 
                        type="password" 
                        autoComplete="new-password"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="w-full pl-12 pr-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" 
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full h-14 bg-[#1c1c1a] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#735c00] transition-all flex items-center justify-center gap-3">
                    {isLoading ? "Validating Matrix Sync..." : isLogin ? "Authenticate to Matrix" : "Establish Professional Identity"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-12 pt-8 border-t border-[#e5e2df] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#74777d]">
                    {isLogin ? "New registrar?" : "Existing operative?"}
                  </span>
                  <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] uppercase font-bold tracking-widest text-[#735c00] hover:underline underline-offset-4 font-black">
                    {isLogin ? "Apply for Registry" : "Credential Access"}
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
