import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { FileText, Gavel, CreditCard, UserCheck, Scale, Mail } from "lucide-react";
import { motion } from "framer-motion";

const TermsConditions = () => {
  return (
    <Layout>
      <Helmet>
        <title>Terms & Conditions | BuildBazaarX</title>
      </Helmet>
      
      <div className="bg-[#f6f3f0]">
        {/* Hero Section */}
        <div className="bg-[#0e0e0d] text-white py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#735c00_0%,transparent_50%)]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <Reveal width="100%" direction="up">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#735c00] mb-4 block">Legal Framework</span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 md:mb-8 tracking-tighter">Terms of <span className="text-[#735c00]">Engagement</span></h1>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl font-medium leading-relaxed">
                The structural agreement governing the interaction between visionaries and the BuildBazaarX monograph network.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-10 md:py-20 -mt-6 md:-mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Sidebar info */}
            <div className="lg:col-span-4 space-y-6 md:space-y-8 order-2 lg:order-1">
              <Reveal direction="right" delay={0.2}>
                <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/5 space-y-6">
                  <div className="w-12 h-12 bg-[#735c00]/10 rounded-2xl flex items-center justify-center text-[#735c00]">
                    <Scale className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-[#0e0e0d]">Legal Clarity</h3>
                  <p className="text-sm text-[#2d2d2a] leading-relaxed font-medium">
                    This document establishes the avant-garde standards for all architectural execution and logistics within our network.
                  </p>
                </div>
              </Reveal>

              <Reveal direction="right" delay={0.3}>
                <div className="bg-[#735c00] p-8 rounded-[2rem] text-white space-y-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">User Integrity</h3>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">
                    By accessing the registry, you commit to the structural monograph standards of the BuildBazaarX network.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Main Policy Content */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <Reveal width="100%" direction="up" delay={0.4} staggerChildren={0.1}>
                <div className="bg-white p-6 sm:p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.03)] border border-black/5 space-y-10 md:space-y-16">
                  
                  <RevealItem>
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">01. Monograph Foundation</h2>
                      </div>
                      <p className="text-[#2d2d2a] leading-relaxed font-medium">
                        Welcome to BuildBazaarX. By accessing and using our website, platform, and services, you accept and agree to be bound by the terms and provision of this agreement.
                      </p>
                    </section>
                  </RevealItem>

                  <RevealItem>
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                          <Gavel className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">02. Execution Standards</h2>
                      </div>
                      <p className="text-[#2d2d2a] leading-relaxed font-medium">
                        BuildBazaarX connects customers with interior design blueprints, raw materials, and professional services. All descriptions of products or product pricing are subject to change at any time without notice.
                      </p>
                    </section>
                  </RevealItem>

                  <RevealItem>
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">03. Financial Logistics</h2>
                      </div>
                      <p className="text-[#2d2d2a] leading-relaxed font-medium">
                        We use Razorpay as our secure payment gateway. By placing an order, you agree to provide current, complete, and accurate purchase and account information.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary/50 rounded-xl border border-black/5 text-[10px] font-black uppercase tracking-widest text-center">Secure Checkout</div>
                        <div className="p-4 bg-secondary/50 rounded-xl border border-black/5 text-[10px] font-black uppercase tracking-widest text-center">Razorpay Verified</div>
                      </div>
                    </section>
                  </RevealItem>

                  <RevealItem>
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                          <Mail className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">04. Legal Registry</h2>
                      </div>
                      <p className="text-[#2d2d2a] leading-relaxed font-medium">
                        Questions about the Terms of Service should be sent to our legal node at:
                      </p>
                      <a href="mailto:legal@buildbazaarx.com" className="inline-flex items-center gap-4 p-6 bg-[#0e0e0d] text-white rounded-2xl hover:bg-[#735c00] transition-all group">
                        <span className="font-black text-sm uppercase tracking-widest">legal@buildbazaarx.com</span>
                        <motion.div whileHover={{ x: 5 }} transition={{ type: "spring" }}>
                          <Mail className="w-5 h-5" />
                        </motion.div>
                      </a>
                    </section>
                  </RevealItem>

                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsConditions;
