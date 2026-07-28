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
import { trackEvent } from "@/lib/umami";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
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
    title: "Phone",
    values: [
      { text: "+91 9521259456", link: "tel:+919521259456" },
      { text: "+91 7309958494", link: "tel:+917309958494" }
    ],
    color: "text-white"
  },
  {
    icon: Mail,
    
    title: "Email",
    values: [
      { text: "jangidrahul9829@gmail.com", link: "mailto:jangidrahul9829@gmail.com" },
      { text: "techie.adi47@gmail.com", link: "mailto:techie.adi47@gmail.com" }
    ],
    color: "text-white"
  },
  {
    icon: MapPin,
    title: "Office",
    values: [
      { text: "Jaipur, Rajasthan, India", link: null }
    ],
    color: "text-white"
  },
  {
    icon: Clock,
    title: "Hours",
    values: [
      { text: "Mon - Sat: 10 AM – 7 PM", link: null }
    ],
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
  "Free Estimate",
  "24h Response",
  "Verified Experts",
  "100% Data Security",
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
      trackEvent("contact-submit", { service: formData.service, city: formData.city });
      
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
      <PageHeader
        title="Share your ideas."
        crumb="Contact"
        subtitle="Connect with our experts. Share your project details for a personalized plan."
      />

      {/* Main Form Section */}
      <section className="py-14 md:py-20 bg-[var(--bg-base)] relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8 md:gap-12 max-w-7xl mx-auto">
            
            {/* Left: Form */}
            <div className="lg:col-span-6">
              <Reveal width="100%" direction="up">
                <div className="mb-8">
                  <h2 className="font-display font-semibold text-2xl md:text-3xl tracking-tight text-[var(--text-primary)] mb-2">Submit a Request</h2>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Enter your details below. We will get back to you within 24 hours.
                  </p>
                </div>
              </Reveal>

              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-6 bg-[var(--bg-surface)] p-6 md:p-10 rounded-2xl border border-[var(--border-subtle)]/60"
              >
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6 relative z-10">
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-xs font-medium text-[var(--text-secondary)] ml-0.5">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Aditya Srivastava"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="rounded-xl h-12 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent-warm)] transition-colors duration-200 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm px-4"
                      />
                    </div>
                  </RevealItem>
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-xs font-medium text-[var(--text-secondary)] ml-0.5">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="rounded-xl h-12 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent-warm)] transition-colors duration-200 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm px-4"
                      />
                    </div>
                  </RevealItem>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 md:gap-8 relative z-10">
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-xs font-medium text-[var(--text-secondary)] ml-0.5">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl h-12 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent-warm)] transition-colors duration-200 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm px-4"
                      />
                    </div>
                  </RevealItem>
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="city" className="text-xs font-medium text-[var(--text-secondary)] ml-0.5">Operational City</Label>
                      <Input
                        id="city"
                        placeholder="Jaipur, RJ"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="rounded-xl h-12 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent-warm)] transition-colors duration-200 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm px-4"
                      />
                    </div>
                  </RevealItem>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 md:gap-8 relative z-10">
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="service" className="text-xs font-medium text-[var(--text-secondary)] ml-0.5">Service</Label>
                      <Select
                        value={formData.service}
                        onValueChange={(value) => setFormData({ ...formData, service: value })}
                      >
                        <SelectTrigger id="service" className="rounded-xl h-12 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent-warm)] transition-colors duration-200 text-[var(--text-primary)] text-sm px-4">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#20293A] text-black dark:text-white border-transparent shadow-xl">
                          {services.map((service) => (
                            <SelectItem key={service} value={service.toLowerCase()} className="rounded-lg hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 focus:text-black dark:focus:text-white cursor-pointer">
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </RevealItem>
                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="budget" className="text-xs font-medium text-[var(--text-secondary)] ml-0.5">Budget</Label>
                      <Select
                        value={formData.budget}
                        onValueChange={(value) => setFormData({ ...formData, budget: value })}
                      >
                        <SelectTrigger id="budget" className="rounded-xl h-12 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent-warm)] transition-colors duration-200 text-[var(--text-primary)] text-sm px-4">
                          <SelectValue placeholder="Select budget" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#20293A] text-black dark:text-white border-transparent shadow-xl">
                          <SelectItem value="under-2l" className="rounded-lg hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer">Under ₹2 Lakh</SelectItem>
                          <SelectItem value="2-5l" className="rounded-lg hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer price-display">₹2 - 5 Lakh</SelectItem>
                          <SelectItem value="5-10l" className="rounded-lg hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer price-display">₹5 - 10 Lakh</SelectItem>
                          <SelectItem value="10-20l" className="rounded-lg hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer price-display">₹10 - 20 Lakh</SelectItem>
                          <SelectItem value="above-20l" className="rounded-lg hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer">Above ₹20 Lakh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </RevealItem>
                </div>

                <RevealItem>
                  <div className="space-y-3 relative z-10">
                    <Label htmlFor="message" className="text-xs font-medium text-[var(--text-secondary)] ml-0.5">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent-warm)] transition-colors duration-200 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm p-4 resize-none"
                    />
                  </div>
                </RevealItem>

                <RevealItem>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[var(--border-subtle)]/60 relative z-10">
                    <p className="text-xs text-[var(--text-tertiary)] max-w-[240px]">
                      By submitting this request, you agree to our terms.
                    </p>
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto rounded-full px-8 h-12 text-sm font-semibold bg-[var(--accent-warm)] text-white hover:opacity-90 transition-opacity"
                      disabled={isSubmitting}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Sending...
                          </>
                         ) : (
                          <>
                           Submit Request
                           <ArrowRight className="ml-1 w-4 h-4" />
                          </>
                         )}
                      </span>
                    </Button>
                  </div>
                </RevealItem>
              </motion.form>
            </div>

            {/* Right: Info Panels */}
            <div className="lg:col-span-6 space-y-5 flex flex-col pt-1 lg:pt-2">
              
              {/* Contact Info Grid */}
              <Reveal width="100%" staggerChildren={0.1}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {contactInfo.map((info, index) => (
                    <RevealItem key={index}>
                      <Card className="border-[var(--border-subtle)]/60 shadow-none bg-[var(--bg-surface)] rounded-2xl h-full">
                        <CardContent className="p-6">
                          <div className="w-10 h-10 bg-[var(--bg-card)] rounded-xl flex items-center justify-center mb-5">
                            <info.icon className="w-5 h-5 text-[var(--accent-warm)]" />
                          </div>
                          <h3 className="font-semibold text-[var(--text-primary)] mb-2 text-sm">{info.title}</h3>
                          <div className="flex flex-col gap-1.5">
                            {info.values.map((v, i) => (
                              v.link ? (
                                <a
                                  key={i}
                                  href={v.link}
                                  className="text-[var(--text-secondary)] hover:text-[var(--accent-warm)] transition-colors text-sm break-all"
                                >
                                  {v.text}
                                </a>
                              ) : (
                                <p key={i} className="text-[var(--text-secondary)] text-sm">{v.text}</p>
                              )
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </RevealItem>
                  ))}
                </div>
              </Reveal>

              {/* WhatsApp */}
              <Reveal width="100%" direction="up" delay={0.4}>
                <Card className="border-[var(--border-subtle)]/60 shadow-none bg-[var(--bg-surface)] rounded-2xl overflow-hidden">
                  <CardContent className="p-7 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-14 h-14 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Chat with us</h3>
                      <p className="text-[var(--text-secondary)] text-sm mb-4">
                        Get instant updates on your project and materials.
                      </p>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5" asChild>
                        <a href="https://wa.me/919521259456" target="_blank" rel="noopener noreferrer">
                          Start Chat
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Guarantees */}
              <Reveal width="100%" direction="up" delay={0.5}>
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-5">
                    <ShieldAlert className="w-4 h-4 text-[var(--accent-warm)]" />
                    <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Our Guarantees</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {trustPoints.map((point, index) => (
                      <div key={index} className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-[var(--accent-warm)] shrink-0" />
                        <span className="text-[var(--text-primary)] text-sm font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Footer quote */}
      <section className="py-16 md:py-20 bg-[var(--bg-surface)]">
        <div className="container mx-auto px-4 text-center">
          <Reveal width="100%" direction="up">
            <div className="max-w-3xl mx-auto">
              <Fingerprint className="w-6 h-6 text-[var(--accent-warm)] mx-auto mb-6" />
              <p className="font-display text-2xl md:text-3xl text-[var(--text-primary)] leading-snug tracking-tight mb-6">
                "Transparency is the foundation of BuildBazaarX."
              </p>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">Jaipur Office</p>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
