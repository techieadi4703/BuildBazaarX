import React from "react";
import { 
  Home, 
  DollarSign, 
  UserCheck, 
  Award, 
  Zap, 
  Shield 
} from "lucide-react";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

const features = [
  {
    icon: Home,
    title: "All-in-One Platform",
    description: "Designs, workers, and materials — everything under one roof.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Clear cost breakdowns with no hidden charges.",
  },
  {
    icon: UserCheck,
    title: "Verified Workers",
    description: "Background-checked skilled professionals for quality execution.",
  },
  {
    icon: Award,
    title: "Quality Material Partners",
    description: "Genuine products from trusted brands like Greenply, Asian Paints.",
  },
  {
    icon: Zap,
    title: "Fast Project Execution",
    description: "Streamlined process for timely project completion.",
  },
  {
    icon: Shield,
    title: "End-to-End Support",
    description: "Dedicated support from design selection to handover.",
  },
];

export const WhyChooseUsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-surface relative overflow-hidden">
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />

      {/* Mesh Gradient Blobs */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <Reveal width="100%" direction="up" distance={30}>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-3 h-3 fill-secondary" />
              The BuildBazaar Advantage
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-serif text-on-surface mb-6 tracking-tight">
              Standardized <span className="italic text-secondary">Excellence</span>.
            </h2>
            <p className="text-on-surface-variant text-xl leading-relaxed max-w-2xl mx-auto">
              We've engineered a platform that eliminates the chaos of home building through 
              rigorous verification and architectural precision.
            </p>
          </div>
        </Reveal>

        {/* Features Grid */}
        <Reveal width="100%" staggerChildren={0.08}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <RevealItem key={index}>
                <motion.div
                  className="group relative p-10 glass-morphism rounded-[2rem] hover:border-secondary/30 transition-all duration-700 hover:shadow-2xl hover:shadow-secondary/5 flex flex-col h-full bg-white/40"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {/* Technical Index Label */}
                  <div className="absolute top-8 right-10 font-mono text-[10px] text-on-surface/20 group-hover:text-secondary/40 transition-colors">
                    REF_ID: 0{index + 1}X
                  </div>

                  <motion.div 
                    className="w-14 h-14 bg-on-surface/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-secondary group-hover:glow-secondary transition-all duration-500"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <feature.icon className="w-6 h-6 text-on-surface group-hover:text-white transition-colors duration-500" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-on-surface mb-4 group-hover:text-secondary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-on-surface-variant/80 text-lg leading-relaxed mb-8 flex-grow group-hover:text-on-surface transition-colors">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] bg-on-surface/10 flex-grow group-hover:bg-secondary/20 transition-colors" />
                    <div className="w-1.5 h-1.5 rounded-full bg-on-surface/10 group-hover:bg-secondary animate-pulse" />
                  </div>
                </motion.div>
              </RevealItem>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
