import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import afterImage from "@/assets/transformations/after.png"; // The furnished version
import beforeImage from "@/assets/transformations/before.png"; // The unfurnished version

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#0B132B] min-h-[85vh] flex items-center justify-center pt-24 pb-8">
      {/* ... (Blueprint Grid Overlay) ... */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      {/* Sub-grid for detail */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '10px 10px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {/* Architectural Image Presentation */}
        <motion.div 
          className="relative w-full max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Decorative tech lines */}
          <div className="absolute -left-12 top-1/4 w-8 h-[1px] bg-[#C5A572]/50 hidden md:block" />
          <div className="absolute -left-20 top-1/4 text-[8px] font-mono text-[#C5A572]/50 hidden md:block uppercase tracking-widest whitespace-nowrap -translate-y-1/2">
            LAT: 28.6139° N
          </div>
          
          <div className="absolute -right-12 bottom-1/4 w-8 h-[1px] bg-[#C5A572]/50 hidden md:block" />
          <div className="absolute -right-20 bottom-1/4 text-[8px] font-mono text-[#C5A572]/50 hidden md:block uppercase tracking-widest whitespace-nowrap -translate-y-1/2">
            LNG: 77.2090° E
          </div>

          <div className="relative rounded-[1rem] p-2 bg-[#0A1128] border border-white/10 shadow-[0_0_100px_rgba(197,165,114,0.05)] mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-[#C5A572]/10 mix-blend-overlay z-10 pointer-events-none" />
            <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden group">
              <BeforeAfterSlider 
                beforeImage={beforeImage} 
                afterImage={afterImage} 
                label="Architectural Render"
              />
            </div>
          </div>
        </motion.div>

        {/* Copy */}
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-6xl text-white mb-6 leading-tight tracking-tight font-serif">
            Architectural <span className="text-[#C5A572]">Precision</span>. <br className="hidden md:block" />
            Total Transparency.
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            The data-driven platform for premium home construction and interiors. <br className="hidden md:block" />
            Experience clarity from blueprint to build.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" asChild className="bg-[#C5A572] hover:bg-[#B89456] text-[#0B132B] border-none px-10 py-6 text-sm font-bold uppercase tracking-widest rounded transition-all">
              <Link to="/designs">
                Explore Projects
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/20 text-white hover:bg-white/5 hover:text-white px-10 py-6 text-sm font-bold uppercase tracking-widest rounded transition-all bg-transparent">
              <Link to="/about#methodology">
                View Methodology
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
