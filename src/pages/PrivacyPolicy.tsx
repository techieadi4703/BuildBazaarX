import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { Shield, Lock, Eye, ShieldCheck, Mail } from "lucide-react";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy | BuildBazaarX</title>
      </Helmet>
      
      <div className="bg-[#f6f3f0]">
        {/* Hero Section */}
        <div className="bg-[#0e0e0d] text-white py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#735c00_0%,transparent_50%)]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <Reveal width="100%" direction="up">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#735c00] mb-4 block">Security Protocol</span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 md:mb-8 tracking-tighter">Privacy <span className="text-[#735c00]">Monograph</span></h1>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl font-medium leading-relaxed">
                Our commitment to data sovereignty and structural transparency in the architectural logistics network.
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
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-[#0e0e0d]">Data Integrity</h3>
                  <p className="text-sm text-[#2d2d2a] leading-relaxed font-medium">
                    We employ structural encryption and decentralized verification to ensure your monograph data remains sovereign.
                  </p>
                </div>
              </Reveal>

              <Reveal direction="right" delay={0.3}>
                <div className="bg-[#735c00] p-8 rounded-[2rem] text-white space-y-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Razorpay Secure</h3>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">
                    All financial execution is handled via PCI-DSS compliant channels. We never store raw payment artifacts.
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
                          <Eye className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">01. Information Acquisition</h2>
                      </div>
                      <p className="text-[#2d2d2a] leading-relaxed font-medium">
                        We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
                      </p>
                    </section>
                  </RevealItem>

                  <RevealItem>
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                          <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">02. Utilization Vectors</h2>
                      </div>
                      <p className="text-[#2d2d2a] leading-relaxed font-medium">
                        We may use the information we collect about you to:
                      </p>
                      <ul className="grid sm:grid-cols-2 gap-4">
                        {[
                          "Maintain avant-garde service quality",
                          "Process secure Razorpay transactions",
                          "Confirm architectural invoices",
                          "Technical support & diagnostics"
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 p-4 bg-secondary/50 rounded-2xl text-xs font-bold uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#735c00]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </RevealItem>

                  <RevealItem>
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">03. Financial Security</h2>
                      </div>
                      <div className="p-8 border-2 border-dashed border-secondary rounded-[2rem] bg-secondary/20">
                        <p className="text-[#2d2d2a] leading-relaxed font-semibold italic">
                          "BuildBazaarX does not store your full credit card or debit card numbers on our servers. All online transactions are processed through Razorpay, a secure, PCI-DSS compliant payment gateway."
                        </p>
                      </div>
                    </section>
                  </RevealItem>

                  <RevealItem>
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                          <Mail className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">04. Contact Registry</h2>
                      </div>
                      <p className="text-[#2d2d2a] leading-relaxed font-medium">
                        If you have any questions about this Privacy Policy or data sovereignty, please contact our data node at:
                      </p>
                      <a href="mailto:privacy@buildbazaarx.com" className="inline-flex items-center gap-4 p-6 bg-[#0e0e0d] text-white rounded-2xl hover:bg-[#735c00] transition-all group">
                        <span className="font-black text-sm uppercase tracking-widest">privacy@buildbazaarx.com</span>
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

export default PrivacyPolicy;
