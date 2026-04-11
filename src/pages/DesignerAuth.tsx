import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Mail, Lock, Palette, ShieldCheck, User, LayoutGrid, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SPECIALIZATIONS = [
  "Modular Kitchen", "Bedroom", "Living Room", "Bathroom",
  "Full Home", "Office Interior", "Kids Room", "Pooja Room", "Wardrobe"
];

export default function DesignerAuth() {
  const [searchParams] = useSearchParams();
  const isLoginParam = searchParams.get("mode") === "login";
  const [isLogin, setIsLogin] = useState(isLoginParam);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/designer/dashboard");
    });
  }, [navigate]);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Authorized", description: "Entering Designer Studio..." });
        navigate("/designer/dashboard");
      } else {
        if (selectedSpecs.length === 0) {
          throw new Error("Please select at least one specialization.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: "designer",
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const { error: designerError } = await supabase.from("designers").insert({
            id: data.user.id,
            full_name: fullName,
            specializations: selectedSpecs,
            is_verified: false,
          });

          if (designerError) throw designerError;

          toast({ title: "Identity Registered", description: "Design profile created successfully." });
          navigate("/designer/dashboard");
        }
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Access Blocked", description: error.message });
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
               <span className="font-body uppercase tracking-[0.2em] text-[10px] text-[#735c00] mb-4 block font-bold">Creative Network</span>
               <h1 className="text-6xl md:text-7xl font-headline tracking-tight leading-none mb-6">
                Designer <br/><span className="italic">{isLogin ? "Access." : "Studio."}</span>
              </h1>
               <div className="w-12 h-[1px] bg-[#c4c6cc] mb-6"></div>
              <p className="text-lg font-body text-[#44474c] leading-relaxed max-w-sm">
                {isLogin 
                  ? "Authenticate to manage your commissions and publish your latest architectural visions." 
                  : "Join the most exclusive directory of certified designers and material architects."}
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
                    <div className="space-y-8">
                       <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Creative Nomenclature *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4c6cc]" />
                          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Specialization Grid (Select All That Apply)</label>
                        <div className="grid grid-cols-2 gap-3">
                          {SPECIALIZATIONS.map(spec => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleSpec(spec)}
                              className={`flex items-center gap-3 p-4 border transition-all rounded-sm ${selectedSpecs.includes(spec) ? "border-[#735c00] bg-[#fcf9f6] text-[#735c00]" : "border-[#e5e2df] text-[#74777d] hover:border-[#c4c6cc] bg-whiteText"}`}
                            >
                               <div className={`w-3 h-3 rounded-full border border-current flex items-center justify-center`}>
                                 {selectedSpecs.includes(spec) && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                               </div>
                               <span className="text-[9px] uppercase font-black tracking-widest">{spec}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Identity Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4c6cc]" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="creative@studio.com" className="w-full pl-12 pr-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Security Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4c6cc]" />
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full pl-12 pr-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full h-14 bg-[#1c1c1a] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#735c00] transition-all flex items-center justify-center gap-3 group">
                    {isLoading ? "Synchronizing..." : isLogin ? "Access Studio" : "Establish Professional Profile"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-12 pt-8 border-t border-[#e5e2df] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#74777d]">
                    {isLogin ? "No active license?" : "Existing resident?"}
                  </span>
                  <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] uppercase font-bold tracking-widest text-[#735c00] hover:underline underline-offset-4 font-black">
                    {isLogin ? "Join the Network" : "Portal Access"}
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
