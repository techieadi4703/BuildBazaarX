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
        }));

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: profile.full_name || prev.name,
            phone: profile.phone || prev.phone,
            city: profile.city || prev.city,
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
      
      toast({
        title: "Thank you for your interest!",
        description: "Our team will contact you within 24 hours.",
      });
      
      setFormData({ name: "", phone: "", city: "", budget: "" });
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
              className={`${isHero ? "bg-[#C5A572] p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)]" : "bg-[#C5A572] p-8 md:p-12 rounded-3xl shadow-xl"} border border-white/20`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`grid ${isCompact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"} gap-6 mb-8`}>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-black/60">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="rounded-xl h-12 bg-white/90 border-black/10 focus:bg-white focus:border-primary transition-all duration-300 text-black placeholder:text-black/60 shadow-sm"
                    />
                  </div>
                </RevealItem>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-wider text-black/60">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="rounded-xl h-12 bg-white/90 border-black/10 focus:bg-white focus:border-primary transition-all duration-300 text-black placeholder:text-black/60 shadow-sm"
                    />
                  </div>
                </RevealItem>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-sm font-bold uppercase tracking-wider text-black/60">City</Label>
                    <Input
                      id="city"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="rounded-xl h-12 bg-white/90 border-black/10 focus:bg-white focus:border-primary transition-all duration-300 text-black placeholder:text-black/60 shadow-sm"
                    />
                  </div>
                </RevealItem>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="budget" className="text-sm font-bold uppercase tracking-wider text-black/60">Budget Range</Label>
                    <Select
                      value={formData.budget}
                      onValueChange={(value) => setFormData({ ...formData, budget: value })}
                    >
                      <SelectTrigger id="budget" className="rounded-xl h-12 bg-white/90 border-black/10 focus:bg-white focus:border-primary transition-all duration-300 text-black shadow-sm">
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-2l">Under ₹2 Lakh</SelectItem>
                        <SelectItem value="2-5l">₹2 - 5 Lakh</SelectItem>
                        <SelectItem value="5-10l">₹5 - 10 Lakh</SelectItem>
                        <SelectItem value="10-20l">₹10 - 20 Lakh</SelectItem>
                        <SelectItem value="above-20l">Above ₹20 Lakh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </RevealItem>
              </div>
              
              <RevealItem>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full sm:w-auto rounded-full px-12 h-14 text-lg font-bold shadow-2xl bg-black text-white hover:bg-black/80 group relative overflow-hidden transition-all duration-500"
                  disabled={isSubmitting}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? "Submitting..." : "Initiate Free Consultation"}
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-white/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </RevealItem>
            </motion.form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
