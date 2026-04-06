import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle,
  CheckCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion, AnimatePresence } from "framer-motion";

const contactInfo = [
  {
    icon: Phone,
    title: "Direct Hotline",
    value: "+91 9521259456",
    link: "tel:+919521259456",
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    icon: Mail,
    title: "Official Email",
    value: "contact@buildbazaarx.com",
    link: "mailto:contact@buildbazaarx.com",
    color: "bg-purple-500/10 text-purple-600"
  },
  {
    icon: MapPin,
    title: "Headquarters",
    value: "Jaipur, Rajasthan, India",
    link: null,
    color: "bg-red-500/10 text-red-600"
  },
  {
    icon: Clock,
    title: "Availability",
    value: "Mon - Sat: 10 AM – 7 PM",
    link: null,
    color: "bg-amber-500/10 text-amber-600"
  },
];

const services = [
  "Home Interior",
  "Construction",
  "Renovation",
  "Raw Materials",
];

const trustPoints = [
  "Free Expert Consultation",
  "Guaranteed 24h Response",
  "Verified Professional Team",
  "100% Price Transparency",
];

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    service: "",
    budget: "",
    message: "",
  });

  useEffect(() => {
    const prefillData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          email: session.user.email || prev.email,
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
        service: formData.service,
        budget: formData.budget,
        message: formData.message || "Contact Form Submission",
      });

      if (error) throw error;
      
      toast({
        title: "Request Submitted Successfully! 🎉",
        description: "Our team will contact you shortly with a personalized plan.",
      });
      
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        service: "",
        budget: "",
        message: "",
      });
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

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary/30 py-24 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <Reveal width="100%" direction="up">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8"
              >
                <MessageCircle className="w-10 h-10 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-7xl font-black text-foreground mb-8 tracking-tight leading-tight">
                Let's Build Your <span className="text-primary">Vision</span> Together
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-xl md:text-2xl font-medium leading-relaxed">
                Connect with our experts today for a free consultation and personalized project cost estimate.
              </p>
            </div>
          </Reveal>
        </div>
        
        {/* Animated Background decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
      </section>

      {/* Main Content */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
            
            {/* Left: Contact Form */}
            <div className="lg:col-span-7">
              <Reveal width="100%" direction="up">
                <div className="mb-12">
                  <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tight">Request a Personalized Quote</h2>
                  <p className="text-muted-foreground text-lg font-medium">
                    Please provide your details below. Our technical team will reach out within 24 hours to guide you.
                  </p>
                </div>
              </Reveal>

              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-8 bg-secondary/20 p-10 md:p-12 rounded-[3.5rem] border border-border/50 shadow-2xl relative overflow-hidden"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid sm:grid-cols-2 gap-8">
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Aditya Srivastava"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-14 rounded-2xl bg-background border-transparent focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                      />
                    </div>
                  </RevealItem>
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="h-14 rounded-2xl bg-background border-transparent focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                      />
                    </div>
                  </RevealItem>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-14 rounded-2xl bg-background border-transparent focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                      />
                    </div>
                  </RevealItem>
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="city" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Your City *</Label>
                      <Input
                        id="city"
                        placeholder="Jaipur, RJ"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="h-14 rounded-2xl bg-background border-transparent focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                      />
                    </div>
                  </RevealItem>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="service" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Interested Services *</Label>
                      <Select
                        value={formData.service}
                        onValueChange={(value) => setFormData({ ...formData, service: value })}
                      >
                        <SelectTrigger id="service" className="h-14 rounded-2xl bg-background border-transparent text-lg">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {services.map((service) => (
                            <SelectItem key={service} value={service.toLowerCase()} className="rounded-xl">
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </RevealItem>
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="budget" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Approximate Budget</Label>
                      <Select
                        value={formData.budget}
                        onValueChange={(value) => setFormData({ ...formData, budget: value })}
                      >
                        <SelectTrigger id="budget" className="h-14 rounded-2xl bg-background border-transparent text-lg">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="under-2l" className="rounded-xl">Under ₹2 Lakh</SelectItem>
                          <SelectItem value="2-5l" className="rounded-xl">₹2 - 5 Lakh</SelectItem>
                          <SelectItem value="5-10l" className="rounded-xl">₹5 - 10 Lakh</SelectItem>
                          <SelectItem value="10-20l" className="rounded-xl">₹10 - 20 Lakh</SelectItem>
                          <SelectItem value="above-20l" className="rounded-xl">Above ₹20 Lakh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </RevealItem>
                </div>

                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Message / Requirements</Label>
                    <div className="relative">
                      <Textarea
                        id="message"
                        placeholder="Tell us about your dream project and specific requirements..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        className="rounded-3xl bg-background border-transparent focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg pt-4"
                      />
                    </div>
                  </div>
                </RevealItem>

                <RevealItem>
                  <Button type="submit" size="lg" className="w-full h-20 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 group overflow-hidden relative" disabled={isSubmitting}>
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <>
                          <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Quote Request
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
                
                {/* Decorative background element in form */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles className="w-32 h-32" />
                </div>
              </motion.form>
            </div>

            {/* Right: Contact Info & Support */}
            <div className="lg:col-span-5 space-y-10">
              
              <Reveal width="100%" direction="up">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-1.5 bg-primary rounded-full" />
                  <h3 className="text-2xl font-black tracking-tight text-foreground">Connect Directly</h3>
                </div>
              </Reveal>

              {/* Contact Cards Grid */}
              <Reveal width="100%" staggerChildren={0.1}>
                <div className="grid sm:grid-cols-2 gap-6">
                  {contactInfo.map((info, index) => (
                    <RevealItem key={index}>
                      <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="border-border/50 shadow-xl bg-background/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all h-full">
                          <CardContent className="p-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform ${info.color}`}>
                              <info.icon className="w-7 h-7" />
                            </div>
                            <h3 className="font-black text-foreground mb-2 text-lg uppercase tracking-tight">{info.title}</h3>
                            {info.link ? (
                              <a
                                href={info.link}
                                className="text-muted-foreground font-bold hover:text-primary transition-colors text-sm break-all"
                              >
                                {info.value}
                              </a>
                            ) : (
                              <p className="text-muted-foreground font-bold text-sm">{info.value}</p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </RevealItem>
                  ))}
                </div>
              </Reveal>

              {/* WhatsApp Premium Card */}
              <Reveal direction="up" delay={0.4}>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="border-none shadow-2xl bg-gradient-to-r from-green-500 to-emerald-600 rounded-[3rem] overflow-hidden relative group">
                    <CardContent className="p-10 text-white relative z-10 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-xl">
                        <MessageCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black mb-4 tracking-tight">WhatsApp Quick Concierge</h3>
                      <p className="text-white/80 font-bold mb-8 leading-relaxed">
                        Get instant support and material updates directly from our Jaipur office team.
                      </p>
                      <Button size="lg" className="bg-white text-green-600 hover:bg-white/90 rounded-2xl h-14 px-8 font-black text-lg shadow-xl shadow-black/10 group/btn" asChild>
                        <a href="https://wa.me/919521259456" target="_blank" rel="noopener noreferrer">
                          Start Chatting
                          <ArrowRight className="ml-3 w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                        </a>
                      </Button>
                    </CardContent>
                    
                    {/* Background bubble */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  </Card>
                </motion.div>
              </Reveal>

              {/* Trust Points Checklist */}
              <Reveal width="100%" direction="up" delay={0.5}>
                <div className="p-10 rounded-[3rem] bg-secondary/30 border border-border/50">
                  <h3 className="font-black text-foreground mb-8 text-xl tracking-tight">The BuildBazaarX Protocol</h3>
                  <div className="grid gap-6">
                    {trustPoints.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-4 group"
                      >
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-foreground font-extrabold text-sm tracking-tight">{point}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Quote Bottom Section */}
      <section className="py-24 bg-card border-t border-border/50 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Reveal width="100%" direction="up">
            <div className="max-w-4xl mx-auto">
              <span className="text-primary font-black uppercase tracking-[0.4em] text-xs mb-6 block">Legacy Guaranteed</span>
              <p className="text-2xl md:text-4xl font-extrabold text-foreground leading-snug tracking-tight italic">
                “Transparency isn’t just a feature at <span className="text-primary not-italic">BuildBazaarX</span>; it’s our foundation. Every project we start is a commitment to excellence.”
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                  <img src="/placeholder.svg" alt="CEO" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="font-black text-foreground uppercase tracking-wider text-sm">BuildBazaarX Jaipur</p>
                  <p className="text-xs text-muted-foreground font-bold tracking-[0.2em] uppercase">Core Operations Team</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
        
        {/* Large faint background decorative text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.02]">
          <h2 className="text-[200px] font-black uppercase whitespace-nowrap">BUILD BAZAAR X</h2>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
