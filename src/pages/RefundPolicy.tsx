import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { RefreshCw, XCircle, AlertCircle, Clock, Headset, Mail } from "lucide-react";
import { motion } from "framer-motion";

const RefundPolicy = () => {
  return (
    <Layout>
      <Helmet>
        <title>Refund & Cancellation Policy | BuildBazaarX</title>
      </Helmet>
      
      <div className="bg-[#f6f3f0]">
        {/* Hero Section */}
        <div className="bg-[#0e0e0d] text-white py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#735c00_0%,transparent_50%)]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <Reveal width="100%" direction="up">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#735c00] mb-4 block">Financial Resolution</span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 md:mb-8 tracking-tighter">Refund <span className="text-[#735c00]">Protocols</span></h1>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl font-medium leading-relaxed">
                Our structured monograph for order revocations, material discrepancies, and financial reversals within the network.
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
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-[#0e0e0d]">Rapid Reversal</h3>
                  <p className="text-sm text-[#2d2d2a] leading-relaxed font-medium">
                    Financial credits are processed via Razorpay within 5-7 monograph cycles to ensure account liquidity.
                  </p>
                </div>
              </Reveal>

              <Reveal direction="right" delay={0.3}>
                <div className="bg-[#735c00] p-8 rounded-[2rem] text-white space-y-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Material Integrity</h3>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">
                    Every shipment is structurally verified. Discrepancies are resolved with absolute priority through our logistics node.
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
                          <XCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">01. Revocation Logic</h2>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="p-6 bg-secondary/50 rounded-2xl border border-black/5 space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#735c00]">Raw Materials</span>
                          <p className="text-xs text-[#2d2d2a] leading-relaxed font-semibold">
                            Orders can be revoked within 24 hours without penalty. Post-dispatch revocations incur a 10% structural restocking fee.
                          </p>
                        </div>
                        <div className="p-6 bg-secondary/50 rounded-2xl border border-black/5 space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#735c00]">Design Blueprints</span>
                          <p className="text-xs text-[#2d2d2a] leading-relaxed font-semibold">
                            As digital monograph assets, blueprints are non-revocable once access is granted to the registry.
                          </p>
                        </div>
                      </div>
                    </section>
                  </RevealItem>

                  <RevealItem>
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">02. Structural Discrepancies</h2>
                      </div>
                      <p className="text-[#2d2d2a] leading-relaxed font-medium">
                        If you receive damaged or defective raw materials, please notify the logistics node within 48 hours with photographic evidence. We will arrange for structural replacement or process a full reversal to your original payment method.
                      </p>
                    </section>
                  </RevealItem>

                  <RevealItem>
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                          <Clock className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">03. Reversal Cycle</h2>
                      </div>
                      <p className="text-[#2d2d2a] leading-relaxed font-semibold italic p-6 bg-secondary/20 rounded-2xl border-2 border-dashed border-secondary">
                        "Approved reversals are initiated immediately. Depending on your financial node and payment method, the amount will reflect in your account via Razorpay within 5-7 business cycles."
                      </p>
                    </section>
                  </RevealItem>

                  <RevealItem>
                    <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                          <Headset className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">04. Support Node</h2>
                      </div>
                      <p className="text-[#2d2d2a] leading-relaxed font-medium">
                        For all revocation and reversal inquiries, contact our support node:
                      </p>
                      <a href="mailto:support@buildbazaarx.com" className="inline-flex items-center gap-4 p-6 bg-[#0e0e0d] text-white rounded-2xl hover:bg-[#735c00] transition-all group">
                        <span className="font-black text-sm uppercase tracking-widest">support@buildbazaarx.com</span>
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

export default RefundPolicy;
