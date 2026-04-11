import React from "react";
import { Calculator, HardHat, BarChart3, Search } from "lucide-react";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

export const WhyChooseUsSection = () => {
  return (
    <section className="py-24 bg-[#F4F0EA] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <Reveal width="100%" direction="up">
          <div className="text-center mb-16">
            <h2 className="text-xl md:text-2xl font-black text-[#0B132B] tracking-widest uppercase">
              WHY CHOOSE US: BENTO GRID
            </h2>
          </div>
        </Reveal>

        {/* Bento Grid Layout */}
        <Reveal width="100%" staggerChildren={0.1}>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[200px]">
            
            {/* Cell 1: Large Vertical (Left) */}
            <RevealItem className="md:col-span-4 md:row-span-2 h-full">
               <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full bg-[#F8F6F1] border border-[#0B132B]/10 rounded flex flex-col items-center justify-center text-center p-8 transition-shadow hover:shadow-lg"
               >
                 <div className="w-16 h-16 rounded-full border border-[#C5A572]/30 flex items-center justify-center mb-6 bg-white shadow-sm">
                   <HardHat className="w-8 h-8 text-[#0B132B]" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-sm font-black text-[#0B132B] uppercase tracking-widest mb-4">
                   Verified Workers
                 </h3>
                 <p className="text-[#0B132B]/60 text-xs font-medium leading-relaxed max-w-[220px]">
                   All professionals are rigorously vetted, certified, and performance-rated for quality assurance.
                 </p>
               </motion.div>
            </RevealItem>

            {/* Cell 2: Top Horizontal (Right) */}
            <RevealItem className="md:col-span-8 md:row-span-1 h-full">
               <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full bg-[#F8F6F1] border border-[#0B132B]/10 rounded flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-left py-8 px-12 transition-shadow hover:shadow-lg"
               >
                 <div className="w-16 h-16 rounded-full border border-[#C5A572]/30 flex items-center justify-center mb-6 md:mb-0 md:mr-10 bg-white shadow-sm shrink-0">
                   <Calculator className="w-8 h-8 text-[#0B132B]" strokeWidth={1.5} />
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-[#0B132B] uppercase tracking-widest mb-2 md:mb-3">
                     Clear Pricing
                   </h3>
                   <p className="text-[#0B132B]/60 text-xs font-medium leading-relaxed max-w-[400px]">
                     Transparent cost structures with no hidden fees, powered by real-time market data.
                   </p>
                 </div>
               </motion.div>
            </RevealItem>

            {/* Cell 3: Bottom Left Square (Right-Bottom grid) */}
            <RevealItem className="md:col-span-4 md:row-span-1 h-full">
               <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full bg-[#F8F6F1] border border-[#0B132B]/10 rounded flex flex-col items-center justify-center text-center p-6 transition-shadow hover:shadow-lg"
               >
                 <div className="w-12 h-12 rounded-full border border-[#C5A572]/30 flex items-center justify-center mb-4 bg-white shadow-sm">
                   <BarChart3 className="w-6 h-6 text-[#0B132B]" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-xs font-black text-[#0B132B] uppercase tracking-widest mb-2">
                   Data-Driven Insights
                 </h3>
                 <p className="text-[#0B132B]/60 text-[10px] sm:text-xs font-medium leading-normal max-w-[200px]">
                   Leverage construction analytics for informed decision-making and proper optimization.
                 </p>
               </motion.div>
            </RevealItem>

            {/* Cell 4: Bottom Right Square (Right-Bottom grid) */}
            <RevealItem className="md:col-span-4 md:row-span-1 h-full">
               <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full bg-[#F8F6F1] border border-[#0B132B]/10 rounded flex flex-col items-center justify-center text-center p-6 transition-shadow hover:shadow-lg"
               >
                 <div className="w-12 h-12 rounded-full border border-[#C5A572]/30 flex items-center justify-center mb-4 bg-white shadow-sm">
                   <Search className="w-6 h-6 text-[#0B132B]" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-xs font-black text-[#0B132B] uppercase tracking-widest mb-2">
                   Quality Control
                 </h3>
                 <p className="text-[#0B132B]/60 text-[10px] sm:text-xs font-medium leading-normal max-w-[200px]">
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
