import React from "react";
import { Palette, Calculator, Hammer } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";

const steps = [
  {
    icon: Palette,
    step: "01",
    title: "Choose a Design",
    description: "Browse through 500+ professional home and interior designs. Filter by style, budget, and room type.",
  },
  {
    icon: Calculator,
    step: "02",
    title: "Customize + Get Cost Estimate",
    description: "Personalize your chosen design and get a transparent cost breakdown including materials and labor.",
  },
  {
    icon: Hammer,
    step: "03",
    title: "Hire Workers + Buy Materials",
    description: "Connect with verified workers for on-site execution and order quality materials at best prices.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background technical dots */}
      <div className="absolute inset-0 bg-dot-grid opacity-[0.1] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <Reveal width="100%" direction="up" distance={30}>
          <div className="text-center max-w-3xl mx-auto mb-24">
            <motion.span 
              className="text-primary font-mono text-[10px] uppercase tracking-[0.4em] bg-on-surface/5 px-6 py-2 rounded-full mb-8 inline-block"
              whileHover={{ scale: 1.05 }}
            >
              Operational Workflow
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-serif text-on-surface mt-4 mb-6 tracking-tight">
              The <span className="italic">Process</span> of Progress.
            </h2>
            <p className="text-on-surface-variant text-xl">
              Execution excellence through a streamlined 3-phase framework.
            </p>
          </div>
        </Reveal>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line — draws on scroll */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[1px] bg-on-surface/5 -z-10">
            <motion.div
              className="h-full bg-secondary glow-secondary"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
            />
          </div>
          
          <Reveal width="100%" staggerChildren={0.2}>
            <div className="grid md:grid-cols-3 gap-16 md:gap-12 relative">
              {steps.map((step, index) => (
                <RevealItem key={index}>
                  <motion.div 
                    className="relative text-center group"
                    whileHover={{ y: -8 }}
                  >
                    {/* Icon Container */}
                    <div className="relative inline-flex mb-10">
                      <motion.div 
                        className="w-28 h-28 bg-surface border border-on-surface/5 rounded-2xl flex items-center justify-center shadow-xl relative z-10 group-hover:border-secondary transition-all duration-700 hover:rotate-6 bg-white"
                      >
                        <step.icon className="w-10 h-10 text-on-surface group-hover:text-secondary group-hover:scale-110 transition-all duration-500" />
                      </motion.div>
                      
                      <motion.span 
                        className="absolute -top-4 -right-4 w-12 h-12 secondary-gradient rounded-xl flex items-center justify-center text-white font-mono font-bold text-lg shadow-xl z-20"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 0.8 }}
                      >
                        {step.step}
                      </motion.span>

                      {/* Ripple effect */}
                      <motion.div 
                        className="absolute inset-0 bg-secondary/5 rounded-2xl -z-10"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 1.5 }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-2 mb-4">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface/30 font-mono">Phase_0{index + 1}</span>
                      <h3 className="text-2xl font-bold text-on-surface tracking-tight group-hover:text-secondary transition-colors duration-300">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-on-surface-variant text-lg max-w-[280px] mx-auto leading-relaxed">
                      {step.description}
                    </p>

                    {/* Technical footer decoration */}
                    <div className="mt-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="flex gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-secondary" />
                        <div className="w-8 h-[1px] bg-secondary self-center" />
                        <div className="w-1 h-1 rounded-full bg-secondary" />
                      </div>
                    </div>
                  </motion.div>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-secondary/3 rounded-full blur-[100px] -z-10" />
    </section>
  );
};
