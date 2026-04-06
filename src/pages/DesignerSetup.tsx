import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { Palette, MapPin, User, Sparkles, ArrowRight, ShieldCheck, Briefcase } from "lucide-react";

const SPECIALIZATIONS = [
  "Modular Kitchen", "Bedroom", "Living Room", "Bathroom",
  "Full Home", "Office Interior", "Kids Room", "Pooja Room", "Wardrobe"
];

export default function DesignerSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "", 
    city: "",
    yearsOfExperience: "",
    bio: "",
    specializations: [] as string[]
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/designer/auth");
        return;
      }
      setUserId(session.user.id);
      setForm(prev => ({ ...prev, email: session.user.email || "" }));
      
      const { data } = await supabase
        .from("designers")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (data) {
        navigate("/designer/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSpecializationToggle = (spec: string) => {
    setForm(prev => {
      const isSelected = prev.specializations.includes(spec);
      if (isSelected) {
        return { ...prev, specializations: prev.specializations.filter(s => s !== spec) };
      } else {
        return { ...prev, specializations: [...prev.specializations, spec] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (form.specializations.length === 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Profile",
        description: "Please select at least one creative specialization.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("designers")
        .insert({
          id: userId,
          full_name: form.fullName,
          phone: form.phone,
          email: form.email,
          city: form.city,
          years_experience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : 0,
          bio: form.bio || null,
          specializations: form.specializations,
        });

      if (error) throw error;

      toast({
        title: "Identity Verified! 🎨",
        description: "Welcome to the elite designer community.",
      });
      navigate("/designer/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup Failure",
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
                <Palette className="w-10 h-10 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
                Designer <span className="text-primary italic">Manifesto</span>
              </h1>
              <p className="text-muted-foreground text-xl font-medium">Define your creative identity and share your architectural vision.</p>
            </div>
          </Reveal>

          <Reveal width="100%" direction="up" delay={0.2}>
            <Card className="border-border/50 shadow-2xl bg-background/80 backdrop-blur-xl rounded-[3.5rem] overflow-hidden">
              <div className="bg-primary/5 px-10 py-6 border-b border-border/50 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-widest text-primary/80">Creative Onboarding</h2>
              </div>
              <CardContent className="p-10 md:p-14">
                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Creative Name</Label>
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
                        <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Designer Contact</Label>
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
                        <Label htmlFor="city" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Headquarters (City)</Label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="city" 
                            required 
                            value={form.city}
                            onChange={(e) => setForm({...form, city: e.target.value})}
                            placeholder="Jaipur"
                            className="pl-12 h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                          />
                        </div>
                      </div>
                    </RevealItem>

                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="yearsOfExperience" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Design Tenure (Years)</Label>
                        <div className="relative group">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="yearsOfExperience" 
                            type="number"
                            min="0"
                            required
                            value={form.yearsOfExperience}
                            onChange={(e) => setForm({...form, yearsOfExperience: e.target.value})}
                            placeholder="E.g. 5"
                            className="pl-12 h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                          />
                        </div>
                      </div>
                    </RevealItem>
                    
                    <RevealItem className="md:col-span-2">
                      <div className="space-y-6">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Specializations & Domains</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          {SPECIALIZATIONS.map(spec => (
                            <motion.div 
                              key={spec} 
                              whileHover={{ x: 5 }} 
                              onClick={() => handleSpecializationToggle(spec)}
                              className="flex items-center space-x-4 p-4 rounded-2xl bg-secondary/20 hover:bg-primary/5 transition-colors cursor-pointer group"
                            >
                              <Checkbox 
                                id={`setup-spec-${spec}`} 
                                checked={form.specializations.includes(spec)}
                                onCheckedChange={() => handleSpecializationToggle(spec)}
                                className="scale-125 rounded-lg border-2"
                              />
                              <Label htmlFor={`setup-spec-${spec}`} className="font-bold text-sm text-foreground cursor-pointer tracking-tight">{spec}</Label>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </RevealItem>

                    <RevealItem className="md:col-span-2">
                      <div className="space-y-3">
                        <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Narrative (Optional)</Label>
                        <Textarea 
                          id="bio" 
                          maxLength={400} 
                          placeholder="Tell us about your design philosophy and aesthetic preferences..."
                          value={form.bio}
                          onChange={(e) => setForm({...form, bio: e.target.value})}
                          rows={4}
                          className="rounded-[2.5rem] bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold p-8"
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
                            Establishing Identity...
                          </>
                        ) : (
                          <>
                            Publish Designer Profile
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
