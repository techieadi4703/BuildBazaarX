import React from "react";
import { motion } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";

const phases = [
  {
    phase: "PHASE 01: CHOOSE",
    description: "Select base architectural models and curated design packages based on technical parameters.",
  },
  {
    phase: "PHASE 02: CUSTOMIZE",
    description: "Tailor materials, finishes, and layouts with real-time cost and timeline data integration.",
  },
  {
    phase: "PHASE 03: HIRE",
    description: "Connect with verified, skilled professionals and monitor progress through transparent dashboards.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-12 bg-[var(--bg-surface)] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <Reveal width="100%" direction="up">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-widest uppercase">
              How IT WORKS: OPERATIONAL FRAMEWORK
            </h2>
          </div>
        </Reveal>

        {/* Timeline Visualization */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-12">
          
          {/* Main Horizontal Timeline Line */}
          <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#C5A572] to-transparent opacity-50 shadow-[0_0_10px_rgba(197,165,114,0.5)]" />
          
          <Reveal width="100%" staggerChildren={0.2}>
            <div className="grid md:grid-cols-3 gap-16 md:gap-8">
              {phases.map((phase, index) => (
                <RevealItem key={index}>
                  <div className="flex flex-col items-center text-center group">
                    
                    {/* Radar Node Visualization */}
                    <div className="relative mb-12">
                      <motion.div 
                        className="w-20 h-20 rounded-full border border-[var(--accent-warm)]/30 flex items-center justify-center relative z-10 bg-[var(--bg-surface)]"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      >
                        {/* Inner Dot */}
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-warm)] shadow-[0_0_10px_rgba(197,165,114,0.8)]" />
                        
                        {/* Radar Arcs (simulated with borders) */}
                        <div className="absolute inset-2 border-r-2 border-t-2 border-[var(--accent-warm)]/40 rounded-full animate-spin-slow" />
                        <div className="absolute inset-4 border-l-2 border-b-2 border-[var(--accent-warm)]/20 rounded-full animate-spin-slow direction-reverse" />
                      </motion.div>
                      
                      {/* Glow Behind Node */}
                      <div className="absolute inset-0 bg-[var(--accent-warm)]/10 blur-xl rounded-full" />
                    </div>

                    {/* Phase Copy */}
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-4">
                      {phase.phase}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed max-w-[280px]">
                      {phase.description}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
