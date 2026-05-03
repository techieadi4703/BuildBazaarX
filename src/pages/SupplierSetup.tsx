import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { Store, User as UserIcon, Phone, MapPin, ShieldCheck, Sparkles, ArrowRight, Briefcase, Building } from "lucide-react";

const BUSINESS_TYPES = [
  "Manufacturer", "Wholesaler", "Retailer", "Distributor", "Importer"
];

export default function SupplierSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [setupForm, setSetupForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    city: "",
    gstNumber: "",
    businessType: ""
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/supplier/auth");
          return;
        }

        setUser(session.user);

        const { data: profileData, error: roleError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (roleError) throw roleError;

        if (profileData && profileData.role !== "supplier") {
          navigate("/");
          return;
        }
        
        const { data: profileInfo, error: infoError } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", session.user.id)
          .maybeSingle();

        if (infoError) throw infoError;

        if (profileInfo) {
          const metadata = (session.user as any).user_metadata;
          const businessName = metadata?.business_name || "";

          setSetupForm(prev => ({
            ...prev,
            ownerName: profileInfo.full_name || prev.ownerName,
            phone: profileInfo.phone || prev.phone,
            city: (profileInfo as any).city || prev.city,
            businessName: businessName || prev.businessName
          }));
        }

        const { data, error: supplierError } = await supabase
          .from("suppliers")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (supplierError) throw supplierError;

        if (data) {
          navigate("/supplier/dashboard");
        } else {
          setIsPageLoading(false);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && !err.message?.includes('aborted')) {
          console.error("Setup page check error:", err);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not verify business credentials. Please try logging in again.",
          });
          navigate("/supplier/auth");
        }
      }
    };
    checkUser();
  }, [navigate, toast]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!setupForm.businessType) {
      toast({
        variant: "destructive",
        title: "Profile Incomplete",
        description: "Please select a valid Business Type to continue.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("suppliers")
        .upsert({
          id: user.id,
          business_name: setupForm.businessName,
          owner_name: setupForm.ownerName,
          phone: setupForm.phone,
          email: user.email!,
          city: setupForm.city,
          gst_number: setupForm.gstNumber || null,
          business_type: setupForm.businessType
        });

      if (error) throw error;

      toast({
        title: "Registration Successful! 🏢",
        description: "Your digital warehouse is ready for commerce.",
      });
      navigate("/supplier/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
          >
            <Store className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-[10px] font-black text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Authenticating Business Credentials...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-secondary/10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm"
              >
                <Store className="w-10 h-10 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
                Supplier <span className="text-primary italic">Registration</span>
              </h1>
              <p className="text-muted-foreground text-xl font-medium">Onboard your business to the BuildBazaarX supply network.</p>
            </div>
          </Reveal>

          <Reveal width="100%" direction="up" delay={0.2}>
            <Card className="border-border/50 shadow-2xl bg-background/80 backdrop-blur-xl rounded-[3.5rem] overflow-hidden">
              <div className="bg-primary/5 px-10 py-6 border-b border-border/50 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-widest text-primary/80">Corporate Onboarding</h2>
              </div>
              <CardContent className="p-10 md:p-14">
                <form onSubmit={handleSetup} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="setup-business" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Registered Business Name</Label>
                        <div className="relative group">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="setup-business" 
                            required 
                            value={setupForm.businessName}
                            onChange={(e) => setSetupForm({...setupForm, businessName: e.target.value})}
                            placeholder="E.g. Heritage Marbles Ltd."
                            className="pl-12 h-16 rounded-2xl bg-white border border-secondary/10 focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-base placeholder:text-foreground/30 shadow-inner"
                          />
                        </div>
                      </div>
                    </RevealItem>

                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="setup-owner" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Authorized Representative</Label>
                        <div className="relative group">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="setup-owner" 
                            required 
                            value={setupForm.ownerName}
                            onChange={(e) => setSetupForm({...setupForm, ownerName: e.target.value})}
                            placeholder="Aditya Srivastava"
                            className="pl-12 h-16 rounded-2xl bg-white border border-secondary/10 focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-base placeholder:text-foreground/30 shadow-inner"
                          />
                        </div>
                      </div>
                    </RevealItem>

                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="setup-phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Commercial Hotline</Label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="setup-phone" 
                            required 
                            value={setupForm.phone}
                            onChange={(e) => setSetupForm({...setupForm, phone: e.target.value})}
                            placeholder="+91 XXXXX XXXXX"
                            className="pl-12 h-16 rounded-2xl bg-white border border-secondary/10 focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-base placeholder:text-foreground/30 shadow-inner"
                          />
                        </div>
                      </div>
                    </RevealItem>

                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="setup-city" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Logistics Hub (City)</Label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="setup-city" 
                            required 
                            value={setupForm.city}
                            onChange={(e) => setSetupForm({...setupForm, city: e.target.value})}
                            placeholder="Jaipur"
                            className="pl-12 h-16 rounded-2xl bg-white border border-secondary/10 focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-base placeholder:text-foreground/30 shadow-inner"
                          />
                        </div>
                      </div>
                    </RevealItem>

                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="setup-gst" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">GSTIN (Optional)</Label>
                        <Input 
                          id="setup-gst" 
                          value={setupForm.gstNumber}
                          onChange={(e) => setSetupForm({...setupForm, gstNumber: e.target.value})}
                          placeholder="00XXXXX0000X0Z0"
                          className="h-16 rounded-2xl bg-white border border-secondary/10 focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-base placeholder:text-foreground/30 shadow-inner"
                        />
                      </div>
                    </RevealItem>

                    <RevealItem>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Business Classification</Label>
                        <Select 
                          value={setupForm.businessType} 
                          onValueChange={(v) => setSetupForm({...setupForm, businessType: v})}
                        >
                          <SelectTrigger className="h-16 rounded-2xl bg-white border border-secondary/10 font-bold text-base shadow-inner">
                            <SelectValue placeholder="Select Model" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {BUSINESS_TYPES.map(type => (
                              <SelectItem key={type} value={type} className="rounded-xl">{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </RevealItem>
                  </div>

                  <RevealItem>
                    <Button type="submit" size="lg" className="w-full h-20 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/20 group relative overflow-hidden" disabled={isLoading}>
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {isLoading ? (
                          <>
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            Establishing Presence...
                          </>
                        ) : (
                          <>
                            Activate Supplier Portal
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                          </>
                        )}
                      </span>
                      <motion.div 
                        className="absolute inset-0 bg-primary-foreground/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    </Button>
                  </RevealItem>
                </form>
              </CardContent>

              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Sparkles className="w-48 h-48" />
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </Layout>
  );
}
