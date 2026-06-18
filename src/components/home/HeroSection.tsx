import React from "react";
import { Link } from "react-router-dom";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import afterImage from "@/assets/transformations/after.webp";
import beforeImage from "@/assets/transformations/before.webp";

export const HeroSection = () => {
  return (
    <section className="
      relative blueprint-section
      flex flex-col items-center
      px-6 pt-12 pb-24 text-center overflow-hidden
    ">
      {/* Eyebrow */}
      <div className="
        inline-flex items-center gap-2 mb-6
        px-3 py-1.5 rounded-full
        border border-[var(--accent-warm)]
        bg-[var(--accent-warm-faint)]
        text-[var(--accent-warm)] text-xs font-semibold uppercase tracking-widest
      ">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-warm)] animate-pulse" />
        DPIIT Recognized Startup
      </div>

      {/* Display headline — Sora font */}
      <h1 className="
        font-display font-semibold
        text-4xl md:text-5xl lg:text-[3.5rem]
        text-[var(--text-primary)]
        leading-[1.1] tracking-tight
        max-w-4xl mb-6
      ">
        India's Professional{" "}
        <span className="relative">
          <span className="text-[var(--accent)]">Construction</span>
        </span>
        {" "}Marketplace
      </h1>

      {/* Sub-headline */}
      <p className="
        max-w-2xl mx-auto
        text-lg text-[var(--text-secondary)]
        leading-relaxed mb-10
      ">
        Connect with verified contractors, source quality materials,
        and manage your entire project — from blueprint to brass fittings.
      </p>

      {/* Architectural Image Presentation */}
      <div className="relative w-full max-w-4xl mx-auto mb-16">
        <div className="absolute -left-12 top-1/4 w-8 h-[1px] bg-[var(--accent-warm)]/50 hidden md:block" />
        <div className="absolute -left-20 top-1/4 text-[8px] font-mono text-[var(--accent-warm)]/50 hidden md:block uppercase tracking-widest whitespace-nowrap -translate-y-1/2">
          LAT: 28.6139° N
        </div>
        
        <div className="absolute -right-12 bottom-1/4 w-8 h-[1px] bg-[var(--accent-warm)]/50 hidden md:block" />
        <div className="absolute -right-20 bottom-1/4 text-[8px] font-mono text-[var(--accent-warm)]/50 hidden md:block uppercase tracking-widest whitespace-nowrap -translate-y-1/2">
          LNG: 77.2090° E
        </div>

        <div className="relative rounded-[1rem] p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[0_0_100px_rgba(197,165,114,0.05)] mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-[var(--accent-warm)]/10 mix-blend-overlay z-10 pointer-events-none" />
          <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden group">
            <BeforeAfterSlider 
              beforeImage={beforeImage} 
              afterImage={afterImage} 
              label="Architectural Render"
            />
          </div>
        </div>
      </div>

      {/* CTA group */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link 
          to="/designs"
          className="
            inline-flex items-center justify-center gap-2 
            bg-[var(--accent-warm)] hover:bg-[var(--accent-warm-hover)] 
            text-[var(--text-primary)] text-base font-medium 
            px-7 py-3 rounded-md transition-colors duration-150
          "
        >
          Start Your Project →
        </Link>
        <Link 
          to="/about"
          className="
            inline-flex items-center justify-center gap-2 
            text-[var(--text-secondary)] hover:text-[var(--text-primary)] 
            hover:bg-[var(--bg-surface)] 
            px-7 py-3 text-base font-medium 
            rounded-md transition-colors duration-150
          "
        >
          Browse Professionals
        </Link>
      </div>
    </section>
  );
};
