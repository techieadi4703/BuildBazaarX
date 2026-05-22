import React from "react";
import { Calculator, HardHat, BarChart3, Search } from "lucide-react";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

export const WhyChooseUsSection = () => {
  return (
    <section className="py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <Reveal width="100%" direction="up">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-black text-foreground tracking-widest uppercase">
              WHY CHOOSE US: BENTO GRID
            </h2>
          </div>
        </Reveal>

        {/* Bento Grid Layout */}
        <Reveal width="100%" staggerChildren={0.1}>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[180px]">
            
            {/* Cell 1: Large Vertical (Left) */}
            <RevealItem className="md:col-span-4 md:row-span-2 h-full">
               <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full glass-card flex flex-col items-center justify-center text-center p-8 transition-shadow hover:shadow-glass-lg"
               >
                 <div className="w-16 h-16 rounded-full border border-secondary/30 flex items-center justify-center mb-6 glass shadow-sm">
                   <HardHat className="w-8 h-8 text-foreground" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">
                   Verified Workers
                 </h3>
                 <p className="text-muted-foreground text-xs font-medium leading-relaxed max-w-[220px] mb-6">
                   All professionals are rigorously vetted, certified, and performance-rated for quality assurance.
                 </p>
                 <div className="w-full pt-4 border-t border-foreground/5 flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
                   <span>Vetting: 100%</span>
                   <span>Rating: 4.8+</span>
                 </div>
               </motion.div>
            </RevealItem>

            {/* Cell 2: Top Horizontal (Right) */}
            <RevealItem className="md:col-span-8 md:row-span-1 h-full">
               <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full glass-card flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-left py-6 px-10 transition-shadow hover:shadow-glass-lg"
               >
                 <div className="w-16 h-16 rounded-full border border-secondary/30 flex items-center justify-center mb-6 md:mb-0 md:mr-10 glass shadow-sm shrink-0">
                   <Calculator className="w-8 h-8 text-foreground" strokeWidth={1.5} />
                 </div>
                 <div className="flex-grow">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest">
                        Clear Pricing
                      </h3>
                      <span className="text-[10px] font-mono text-secondary uppercase tracking-tighter">Real-time Data</span>
                   </div>
                   <p className="text-muted-foreground text-xs font-medium leading-relaxed max-w-[440px]">
                     Transparent cost structures with no hidden fees, powered by real-time market data across all material categories.
                   </p>
                 </div>
               </motion.div>
            </RevealItem>

            {/* Cell 3: Bottom Left Square (Right-Bottom grid) */}
            <RevealItem className="md:col-span-4 md:row-span-1 h-full">
               <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full glass-card flex flex-col items-center justify-center text-center p-6 transition-shadow hover:shadow-glass-lg"
               >
                 <div className="w-12 h-12 rounded-full border border-secondary/30 flex items-center justify-center mb-3 glass shadow-sm">
                   <BarChart3 className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-2">
                   Data-Driven Insights
                 </h3>
                 <p className="text-muted-foreground text-[10px] font-medium leading-snug max-w-[180px]">
                   Leverage analytics for informed decision-making and project optimization.
                 </p>
               </motion.div>
            </RevealItem>

            {/* Cell 4: Bottom Right Square (Right-Bottom grid) */}
            <RevealItem className="md:col-span-4 md:row-span-1 h-full">
               <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full glass-card flex flex-col items-center justify-center text-center p-6 transition-shadow hover:shadow-glass-lg"
               >
                 <div className="w-12 h-12 rounded-full border border-secondary/30 flex items-center justify-center mb-3 glass shadow-sm">
                   <Search className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-2">
                   Quality Control
                 </h3>
                 <p className="text-muted-foreground text-[10px] font-medium leading-snug max-w-[180px]">
                   Multi-stage inspections and adherence to strict technical standards.
                 </p>
               </motion.div>
            </RevealItem>

          </div>
        </Reveal>

      </div>
    </section>
  );
};
