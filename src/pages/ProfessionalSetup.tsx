import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { Wrench, MapPin, User, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

const PROFESSIONS = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Mason",
  "HVAC Technician",
  "Interior Fitter",
  "Welder",
  "False Ceiling Expert",
  "Tile Layer",
  "Glass & Aluminium Worker"
];

export default function ProfessionalSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: "",
    profession: "",
    phone: "",
    city: "",
    address: "",
    pincode: "",
    hourlyRate: "",
    dailyRate: "",
    bio: ""
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/professional/auth");
        return;
      }
      setUserId(session.user.id);
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileData && profileData.role !== "professional") {
        navigate("/");
        return;
      }
      
      const { data } = await supabase
        .from("professionals")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (data) {
        navigate("/professional/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("professionals")
        .insert({
          id: userId,
          full_name: form.fullName,
          profession: form.profession,
          phone: form.phone,
          city: form.city,
          address: form.address || null,
          pincode: form.pincode || null,
          hourly_rate: form.hourlyRate ? parseInt(form.hourlyRate) : null,
          daily_rate: form.dailyRate ? parseInt(form.dailyRate) : null,
          bio: form.bio || null,
        });

      if (error) throw error;

      toast({
        title: "Profile Configured! ✨",
        description: "Your professional workspace is ready.",
      });
      navigate("/professional/dashboard");
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
                <Wrench className="w-10 h-10 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
                Professional <span className="text-primary italic">Onboarding</span>
              </h1>
              <p className="text-muted-foreground text-xl font-medium">Complete your technical profile to start receiving client projects.</p>
            </div>
          </Reveal>

          <Reveal width="100%" direction="up" delay={0.2}>
            <Card className="border-border/50 shadow-2xl bg-background/80 backdrop-blur-xl rounded-[3rem] overflow-hidden">
              <div className="bg-primary/5 px-10 py-6 border-b border-border/50 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-widest text-primary/80">Identity & Workspace</h2>
              </div>
              <CardContent className="p-10 md:p-14">
                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Legal Name</Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="fullName" 
                            required 
                            value={form.fullName}
                            onChange={(e) => setForm({...form, fullName: e.target.value})}
                            placeholder="Aditya Srivastava"
                            className="pl-12 h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                          />
                        </div>
                      </div>
                    </RevealItem>
                    
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="profession" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Specialization</Label>
                        <Select 
                          required 
                          value={form.profession}
                          onValueChange={(val) => setForm({...form, profession: val})}
                        >
                          <SelectTrigger id="profession" className="h-14 rounded-2xl bg-secondary/30 border-transparent font-bold">
                            <SelectValue placeholder="What do you do best?" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {PROFESSIONS.map(prof => (
                              <SelectItem key={prof} value={prof} className="rounded-xl">{prof}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </RevealItem>

                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Contact</Label>
                        <Input 
                          id="phone" 
                          required 
                          value={form.phone}
                          onChange={(e) => setForm({...form, phone: e.target.value})}
                          placeholder="+91 XXXXX XXXXX"
                          className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                      </div>
                    </RevealItem>

                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="city" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Working City</Label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="city" 
                            required 
                            value={form.city}
                            onChange={(e) => setForm({...form, city: e.target.value})}
                            placeholder="E.g. Jaipur"
                            className="pl-12 h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                          />
                        </div>
                      </div>
                    </RevealItem>

                    <RevealItem className="md:col-span-2">
                      <div className="space-y-3">
                        <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Service Address (Optional)</Label>
                        <Input 
                          id="address" 
                          value={form.address}
                          onChange={(e) => setForm({...form, address: e.target.value})}
                          placeholder="Shop / Office No, Area..."
                          className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                      </div>
                    </RevealItem>

                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="pincode" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Pincode</Label>
                        <Input 
                          id="pincode" 
                          value={form.pincode}
                          onChange={(e) => setForm({...form, pincode: e.target.value})}
                          placeholder="6-Digit Code"
                          className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                      </div>
                    </RevealItem>

                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="hourlyRate" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Hourly Consultation (₹)</Label>
                        <Input 
                          id="hourlyRate" 
                          type="number"
                          min="0"
                          value={form.hourlyRate}
                          onChange={(e) => setForm({...form, hourlyRate: e.target.value})}
                          placeholder="E.g. 500"
                          className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                      </div>
                    </RevealItem>

                    <RevealItem className="md:col-span-2">
                      <div className="space-y-3">
                        <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Bio (Optional)</Label>
                        <Textarea 
                          id="bio" 
                          maxLength={300} 
                          value={form.bio}
                          onChange={(e) => setForm({...form, bio: e.target.value})}
                          placeholder="A brief summary of your expertise and experience..."
                          rows={4}
                          className="rounded-[2rem] bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold p-6"
                        />
                      </div>
                    </RevealItem>
                  </div>

                  <RevealItem>
                    <Button type="submit" size="lg" className="w-full h-20 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/20 group relative overflow-hidden" disabled={isLoading}>
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {isLoading ? (
                          <>
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            Finalizing Workspace...
                          </>
                        ) : (
                          <>
                            Complete Professional Setup
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
              
              {/* Decorative background shape */}
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
