import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FloatingBubbles } from "@/components/ui/FloatingBubbles";
import { motion } from "framer-motion";
import { Reveal, RevealItem } from "./Reveal";
import { sendToActivepieces } from "@/utils/activepieces";

interface LeadCaptureFormProps {
  variant?: "default" | "compact" | "hero";
  title?: string;
  subtitle?: string;
}

export const LeadCaptureForm = ({ 
  variant = "default",
  title = "Plan Your Dream Home Today",
  subtitle = "Get a free consultation and cost estimate from our experts."
}: LeadCaptureFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    budget: "",
  });

  useEffect(() => {
    const prefillData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata?.full_name || prev.name,
          email: session.user.email || prev.email,
        }));

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          const userProfile = profile as { full_name?: string; phone?: string; city?: string };
          setFormData(prev => ({
            ...prev,
            name: userProfile.full_name || prev.name,
            phone: userProfile.phone || prev.phone,
            city: userProfile.city || prev.city,
          }));
        }
      }
    };
    prefillData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("leads").insert({
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        budget: formData.budget,
        message: `Consultation Request (Variant: ${variant})`,
      });

      if (error) throw error;
      
      // Fire-and-forget Activepieces integration
      const numericPhone = formData.phone.replace(/\D/g, "");
      if (numericPhone.length >= 10 && numericPhone.length <= 13) {
        // Send data in background without awaiting
        sendToActivepieces({
          fullName: formData.name,
          phoneNumber: formData.phone,
          email: formData.email,
          city: formData.city,
          budgetRange: formData.budget,
          submittedAt: new Date().toISOString(),
          source: "homepage_consultation_form"
        });
      }
      
      toast({
        title: "Thank you for your interest!",
        description: "Our team will contact you within 24 hours.",
      });
      
      setFormData({ name: "", phone: "", email: "", city: "", budget: "" });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong while submitting your request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompact = variant === "compact";
  const isHero = variant === "hero";

  return (
    <section className={`relative overflow-hidden ${isHero ? "py-16 md:py-20 bg-primary" : "py-16 md:py-20 bg-secondary/30"}`}>
      {/* Bubbles */}
      <FloatingBubbles count={isHero ? 20 : 12} palette={isHero ? "neutral" : "brand"} className="opacity-40" />

      <div className="container mx-auto px-4 relative z-10">
        <div className={`${isHero ? "max-w-4xl" : "max-w-2xl"} mx-auto`}>
          {/* Header */}
          <Reveal width="100%" direction="up">
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-5xl font-bold mb-4 tracking-tight ${isHero ? "text-primary-foreground" : "text-foreground"}`}>
                {title}
              </h2>
              <p className={`text-lg ${isHero ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {subtitle}
              </p>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal width="100%" direction="up" delay={0.2}>
            <motion.form
              onSubmit={handleSubmit}
              className={`${isHero ? "bg-[var(--bg-card)] p-5 md:p-12 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)]" : "bg-[var(--bg-card)] p-5 md:p-12 rounded-[3rem] shadow-xl"} border border-[var(--border-subtle)] relative overflow-hidden`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.5 }}
            >
              {/* Visual Blueprint accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--bg-surface)]/50 rounded-bl-[4rem] flex items-center justify-center border-l border-b border-[var(--border-subtle)]/10">
                <span className="font-mono text-[10px] rotate-90 tracking-[0.5em] opacity-20 text-[var(--text-primary)] uppercase">Form_Asset</span>
              </div>
              <div className={`grid ${isCompact ? "sm:grid-cols-2 lg:grid-cols-5" : "sm:grid-cols-2"} gap-4 md:gap-8 relative z-10 mb-8`}>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)] ml-1">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11 sm:h-14 w-full rounded-2xl bg-black/5 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 focus:bg-black/10 dark:focus:bg-black/30 focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-sm px-4"
                    />
                  </div>
                </RevealItem>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)] ml-1">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="h-11 sm:h-14 w-full rounded-2xl bg-black/5 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 focus:bg-black/10 dark:focus:bg-black/30 focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-sm px-4"
                    />
                  </div>
                </RevealItem>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)] ml-1">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11 sm:h-14 w-full rounded-2xl bg-black/5 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 focus:bg-black/10 dark:focus:bg-black/30 focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-sm px-4"
                    />
                  </div>
                </RevealItem>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)] ml-1">City</Label>
                    <Input
                      id="city"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="h-11 sm:h-14 w-full rounded-2xl bg-black/5 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 focus:bg-black/10 dark:focus:bg-black/30 focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-sm px-4"
                    />
                  </div>
                </RevealItem>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="budget" className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-secondary)] ml-1">Budget Range</Label>
                    <Select
                      value={formData.budget}
                      onValueChange={(value) => setFormData({ ...formData, budget: value })}
                    >
                      <SelectTrigger id="budget" className="h-11 sm:h-14 w-full rounded-2xl bg-black/5 dark:bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/10 focus:bg-black/10 dark:focus:bg-black/30 focus:ring-2 focus:ring-[var(--accent)]/20 transition-all font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-sm px-4">
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg bg-secondary/30 text-[var(--text-primary)] border-transparent shadow-xl">
                        <SelectItem value="under-2l" className="rounded-lg hover:bg-secondary/30/50 cursor-pointer">Under ₹2 Lakh</SelectItem>
                        <SelectItem value="2-5l" className="rounded-lg hover:bg-secondary/30/50 cursor-pointer price-display">₹2 - 5 Lakh</SelectItem>
                        <SelectItem value="5-10l" className="rounded-lg hover:bg-secondary/30/50 cursor-pointer price-display">₹5 - 10 Lakh</SelectItem>
                        <SelectItem value="10-20l" className="rounded-lg hover:bg-secondary/30/50 cursor-pointer price-display">₹10 - 20 Lakh</SelectItem>
                        <SelectItem value="above-20l" className="rounded-lg hover:bg-secondary/30/50 cursor-pointer">Above ₹20 Lakh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </RevealItem>
              </div>
              
              <RevealItem>
                <div className="relative z-10">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full sm:w-auto rounded-full px-12 h-16 text-lg font-bold shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-[var(--accent)] text-white hover:bg-[var(--accent)]/80 group relative overflow-hidden transition-all duration-500"
                    disabled={isSubmitting}
                  >
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? "Submitting..." : "Get Free Consultation"}
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-white/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
                </div>
              </RevealItem>
            </motion.form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
