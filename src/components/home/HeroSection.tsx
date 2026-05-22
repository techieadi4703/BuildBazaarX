import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-interior.jpg"; // Re-using existing image, but styling it like a blueprint architectural render

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center justify-center pt-24 pb-8">
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {/* Architectural Image Presentation — glass panel */}
        <motion.div 
          className="relative w-full max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Decorative tech lines */}
          <div className="absolute -left-12 top-1/4 w-8 h-[1px] bg-secondary/50 hidden md:block" />
          <div className="absolute -left-20 top-1/4 text-[8px] font-mono text-secondary/50 hidden md:block uppercase tracking-widest whitespace-nowrap -translate-y-1/2">
            LAT: 28.6139° N
          </div>
          
          <div className="absolute -right-12 bottom-1/4 w-8 h-[1px] bg-secondary/50 hidden md:block" />
          <div className="absolute -right-20 bottom-1/4 text-[8px] font-mono text-secondary/50 hidden md:block uppercase tracking-widest whitespace-nowrap -translate-y-1/2">
            LNG: 77.2090° E
          </div>

          <div className="relative glass-panel p-2 mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-secondary/10 mix-blend-overlay z-10 pointer-events-none" />
            <div className="relative w-full h-[400px] md:h-[500px]">
              {/* Single Image with fetchpriority */}
              <img
                src={heroImage}
                alt="Architectural Render"
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />

              {/* Grayscale overlay animated to reveal color from top to bottom */}
              <motion.div
                className="absolute inset-0 w-full h-full rounded-lg z-10 backdrop-grayscale backdrop-brightness-75"
                animate={{ clipPath: ["inset(0 0 0 0)", "inset(100% 0 0 0)", "inset(0 0 0 0)"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />

              {/* Horizontal scan line effect */}
              <motion.div 
                className="absolute left-0 right-0 h-[2px] bg-secondary z-20 shadow-[0_0_15px_hsl(var(--secondary)/0.8)]"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
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
          <h1 className="text-4xl md:text-6xl text-foreground mb-6 leading-tight tracking-tight font-serif">
            Architectural <span className="text-secondary">Precision</span>. <br className="hidden md:block" />
            Total Transparency.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            The data-driven platform for premium home construction and interiors. <br className="hidden md:block" />
            Experience clarity from blueprint to build.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90 text-white border-none px-10 py-6 text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-glass">
              <Link to="/designs">
                Explore Projects
              </Link>
            </Button>
            <Button size="lg" variant="glass" asChild className="px-10 py-6 text-sm font-bold uppercase tracking-widest rounded-xl">
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
