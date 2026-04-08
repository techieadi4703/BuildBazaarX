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
    <section className="py-24 md:py-32 bg-surface-container relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <Reveal width="100%" direction="up" distance={30}>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <motion.span 
              className="text-primary-container font-bold text-sm uppercase tracking-widest bg-primary-container/5 px-4 py-1.5 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              Our Advantage
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-6 mb-4 tracking-tight">
              Why Choose BuildBazaarX?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We bring together everything you need to build or renovate your home with confidence.
            </p>
          </div>
        </Reveal>

        {/* Features Grid */}
        <Reveal width="100%" staggerChildren={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <RevealItem key={index}>
                <motion.div
                  className="group p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 hover:border-secondary/40 transition-all duration-500 hover:shadow-ambient h-full flex flex-col"
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-primary-container/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-container group-hover:text-white transition-colors duration-500"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  >
                    <feature.icon className="w-8 h-8 text-primary-container group-hover:text-white transition-colors duration-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-on-surface mb-3 group-hover:text-secondary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6 flex-grow">
                    {feature.description}
                  </p>
                  
                  {/* Subtle arrow pointer */}
                  <div className="w-8 h-0.5 bg-secondary/40 group-hover:w-full transition-all duration-500" />
                </motion.div>
              </RevealItem>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Background design */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 border border-primary/10 rounded-full" />
        <div className="absolute bottom-20 left-10 w-64 h-64 border border-accent/10 rounded-full" />
      </div>
    </section>
  );
};
