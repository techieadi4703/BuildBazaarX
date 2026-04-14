import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  Fingerprint
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
import { motion } from "framer-motion";

const contactInfo = [
  {
    icon: Phone,
    title: "Direct Hotline",
    value: "+91 9521259456",
    link: "tel:+919521259456",
    color: "text-white"
  },
  {
    icon: Mail,
    title: "Official Email",
    value: "contact@buildbazaarx.com",
    link: "mailto:contact@buildbazaarx.com",
    color: "text-white"
  },
  {
    icon: MapPin,
    title: "Headquarters",
    value: "Jaipur, Rajasthan, India",
    link: null,
    color: "text-white"
  },
  {
    icon: Clock,
    title: "Availability",
    value: "Mon - Sat: 10 AM – 7 PM",
    link: null,
    color: "text-white"
  },
];

const services = [
  "Home Interior",
  "Construction",
  "Renovation",
  "Raw Materials",
];

const trustPoints = [
  "Free Algorithmic Estimate",
  "Priority 24h Response",
  "Verified Subject Experts",
  "100% Data Fidelity",
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
          .single() as any;

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
        message: formData.message || "Priority Contact Submission",
      });

      if (error) throw error;
      
      toast({
        title: "Protocol Initiated",
        description: "Your requisition is logged. An authority will contact you shortly.",
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
        title: "Transmission Failed",
        description: error.message || "Check your uplink and try logging the request again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Contact Us | BuildBazaarX – Get a Free Estimate</title>
        <meta name="description" content="Connect with BuildBazaarX for home interior, construction or raw material sourcing. Get a free algorithmic estimate. Call +91 9521259456 or fill the form — response within 24 hours." />
        <link rel="canonical" href="https://buildbazaarx.com/contact" />
        <meta property="og:url" content="https://buildbazaarx.com/contact" />
        <meta property="og:title" content="Contact Us | BuildBazaarX" />
        <meta property="og:description" content="Reach our team in Jaipur. Free estimates, 24h response, and verified subject experts for every construction need." />
      </Helmet>
      {/* Blueprint Hero Section */}
      <section className="relative overflow-hidden bg-primary-container pt-32 pb-24 md:pt-48 md:pb-32">
        <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Reveal width="100%" direction="up">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
              <span className="font-mono text-[10px] md:text-xs text-[#C5A572] uppercase tracking-[0.5em] mb-6 block border border-[#C5A572]/30 px-4 py-1.5 rounded-full bg-[#C5A572]/10 backdrop-blur-sm">
                Communication_Link
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[1.1]">
                Deploy Your <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-white to-[#C5A572]">Vision.</span>
              </h1>
              <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-2xl font-medium leading-relaxed">
                Connect with the engineering vanguard. Transmit your project parameters for a highly customized architectural assessment.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Main Command Center Form */}
      <section className="py-24 bg-[#F4F0EA] relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
            
            {/* Left: Gold Form */}
            <div className="lg:col-span-7">
              <Reveal width="100%" direction="up">
                <div className="mb-10">
                  <h2 className="text-4xl font-black text-black mb-4 tracking-tighter">Submit Execution Request</h2>
                  <p className="text-black/60 text-lg font-medium">
                    Input your primary parameters below. Action protocols proceed strictly within 24 operational hours.
                  </p>
                </div>
              </Reveal>

              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-8 bg-[#C5A572] p-8 md:p-12 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.5 }}
              >
                {/* Visual Blueprint accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-bl-[4rem] flex items-center justify-center border-l border-b border-black/10">
                  <span className="font-mono text-[10px] rotate-90 tracking-[0.5em] opacity-20 text-black uppercase">Form_Asset</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-8 relative z-10">
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-[10px] uppercase font-mono tracking-widest text-black/60 ml-1">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Aditya Srivastava"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="rounded-2xl h-14 bg-[#E5DACE] border-transparent focus:bg-white transition-all duration-300 text-black placeholder:text-black/40 text-lg px-6"
                      />
                    </div>
                  </RevealItem>
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-[10px] uppercase font-mono tracking-widest text-black/60 ml-1">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="rounded-2xl h-14 bg-[#E5DACE] border-transparent focus:bg-white transition-all duration-300 text-black placeholder:text-black/40 text-lg px-6"
                      />
                    </div>
                  </RevealItem>
                </div>

                <div className="grid sm:grid-cols-2 gap-8 relative z-10">
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-[10px] uppercase font-mono tracking-widest text-black/60 ml-1">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-2xl h-14 bg-[#E5DACE] border-transparent focus:bg-white transition-all duration-300 text-black placeholder:text-black/40 text-lg px-6"
                      />
                    </div>
                  </RevealItem>
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="city" className="text-[10px] uppercase font-mono tracking-widest text-black/60 ml-1">Operational City</Label>
                      <Input
                        id="city"
                        placeholder="Jaipur, RJ"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="rounded-2xl h-14 bg-[#E5DACE] border-transparent focus:bg-white transition-all duration-300 text-black placeholder:text-black/40 text-lg px-6"
                      />
                    </div>
                  </RevealItem>
                </div>

                <div className="grid sm:grid-cols-2 gap-8 relative z-10">
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="service" className="text-[10px] uppercase font-mono tracking-widest text-black/60 ml-1">Target Service</Label>
                      <Select
                        value={formData.service}
                        onValueChange={(value) => setFormData({ ...formData, service: value })}
                      >
                        <SelectTrigger id="service" className="rounded-2xl h-14 bg-[#E5DACE] border-transparent focus:bg-white transition-all duration-300 text-black text-lg px-6">
                          <SelectValue placeholder="Select target parameter" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white text-black border-transparent shadow-xl">
                          {services.map((service) => (
                            <SelectItem key={service} value={service.toLowerCase()} className="rounded-lg hover:bg-black/5 focus:bg-black/5 focus:text-black cursor-pointer">
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </RevealItem>
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="budget" className="text-[10px] uppercase font-mono tracking-widest text-black/60 ml-1">Capital Allocation</Label>
                      <Select
                        value={formData.budget}
                        onValueChange={(value) => setFormData({ ...formData, budget: value })}
                      >
                        <SelectTrigger id="budget" className="rounded-2xl h-14 bg-[#E5DACE] border-transparent focus:bg-white transition-all duration-300 text-black text-lg px-6">
                          <SelectValue placeholder="Select capital bounds" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white text-black border-transparent shadow-xl">
                          <SelectItem value="under-2l" className="rounded-lg hover:bg-black/5 cursor-pointer">Under ₹2 Lakh</SelectItem>
                          <SelectItem value="2-5l" className="rounded-lg hover:bg-black/5 cursor-pointer">₹2 - 5 Lakh</SelectItem>
                          <SelectItem value="5-10l" className="rounded-lg hover:bg-black/5 cursor-pointer">₹5 - 10 Lakh</SelectItem>
                          <SelectItem value="10-20l" className="rounded-lg hover:bg-black/5 cursor-pointer">₹10 - 20 Lakh</SelectItem>
                          <SelectItem value="above-20l" className="rounded-lg hover:bg-black/5 cursor-pointer">Above ₹20 Lakh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </RevealItem>
                </div>

                <RevealItem>
                  <div className="space-y-3 relative z-10">
                    <Label htmlFor="message" className="text-[10px] uppercase font-mono tracking-widest text-black/60 ml-1">Architectural Brief</Label>
                    <Textarea
                      id="message"
                      placeholder="Specify blueprint dimensions, materials required, and ultimate vision details..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="rounded-2xl bg-[#E5DACE] border-transparent focus:bg-white transition-all duration-300 text-black placeholder:text-black/40 text-lg p-6 resize-none"
                    />
                  </div>
                </RevealItem>

                <RevealItem>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-6 border-t border-black/10 relative z-10">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/50 max-w-[240px]">
                      By deploying this request, you accept full operational terms.
                    </p>
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto rounded-full px-12 h-16 text-lg font-bold shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-black text-white hover:bg-black/80 transition-all duration-300 group relative overflow-hidden"
                      disabled={isSubmitting}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                           <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                           Compiling...
                          </>
                         ) : (
                          <>
                           Execute Request
                           <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                         )}
                      </span>
                      <motion.div 
                        className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    </Button>
                  </div>
                </RevealItem>
              </motion.form>
            </div>

            {/* Right: Info Panels / Bento */}
            <div className="lg:col-span-5 space-y-8 flex flex-col pt-12 lg:pt-24">
              
              {/* Communication Interface Grid */}
              <Reveal width="100%" staggerChildren={0.1}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {contactInfo.map((info, index) => (
                    <RevealItem key={index}>
                      <Card className="border-black/5 shadow-none bg-white rounded-3xl h-full group hover:shadow-xl transition-all duration-400">
                        <CardContent className="p-6">
                          <div className={`w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center mb-6 border border-black/10 group-hover:scale-110 transition-transform ${info.color}`}>
                            <info.icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-bold text-black mb-1 text-sm uppercase tracking-widest">{info.title}</h3>
                          {info.link ? (
                            <a
                              href={info.link}
                              className="text-black/60 font-medium hover:text-[#C5A572] transition-colors text-sm break-all"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="text-black/60 font-medium text-sm">{info.value}</p>
                          )}
                        </CardContent>
                      </Card>
                    </RevealItem>
                  ))}
                </div>
              </Reveal>

              {/* Secure WhatsApp Bridge Block */}
              <Reveal width="100%" direction="up" delay={0.4}>
                <Card className="border-white/10 shadow-2xl bg-[#131b2E] rounded-3xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-[100%] pointer-events-none" />
                  <CardContent className="p-10 flex flex-col sm:flex-row items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-[2rem] flex items-center justify-center shrink-0 border border-green-500/30 group-hover:scale-110 transition-all duration-500">
                      <MessageCircle className="w-10 h-10" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#C5A572] block mb-2">Priority_Comms</span>
                      <h3 className="text-2xl font-black text-white mb-2 leading-none">Instant Bridge</h3>
                      <p className="text-white/60 font-medium text-sm mb-6 leading-relaxed">
                        Access raw material logistics and architectural status in real-time.
                      </p>
                      <Button className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20" asChild>
                        <a href="https://wa.me/919521259456" target="_blank" rel="noopener noreferrer">
                          Engage Team
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Protocol Specs */}
              <Reveal width="100%" direction="up" delay={0.5}>
                <div className="p-8 pb-4">
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldAlert className="w-5 h-5 text-[#C5A572]" />
                    <h3 className="font-mono text-[10px] tracking-[0.2em] text-black/40 uppercase">Operational Integrity</h3>
                  </div>
                  <div className="space-y-4">
                    {trustPoints.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-4"
                      >
                        <CheckCircle className="w-4 h-4 text-[#C5A572]" />
                        <span className="text-black/80 font-bold text-sm">{point}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Legacy Footer block */}
      <section className="py-32 bg-primary-container relative overflow-hidden flex items-center justify-center min-h-[500px]">
        <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Reveal width="100%" direction="up">
            <div className="max-w-4xl mx-auto">
              <div className="w-16 h-16 mx-auto bg-[#C5A572]/10 border border-[#C5A572]/30 rounded-2xl flex items-center justify-center mb-8">
                <Fingerprint className="w-8 h-8 text-[#C5A572]" />
              </div>
              <p className="text-3xl md:text-5xl font-serif text-white leading-snug tracking-tight italic mb-10">
                “Transparency is not an add-on; it is the structural integrity of <span className="text-[#C5A572]">BuildBazaarX</span>'s operations.”
              </p>
              <div className="flex flex-col items-center">
                <p className="font-black text-white uppercase tracking-widest text-sm mb-1">Executive Board</p>
                <p className="text-xs text-white/50 font-medium font-mono uppercase">Jaipur Sector Control</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
