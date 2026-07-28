import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import afterImage from "@/assets/transformations/after.webp";

export const HeroSection = () => {
  return (
    <section className="relative -mt-16 md:-mt-20 pt-16 md:pt-20 h-[calc(92vh+4rem)] md:h-[calc(92vh+5rem)] min-h-[620px] w-full overflow-hidden flex items-end">
      {/* Full-bleed background image — extends under the fixed header */}
      <motion.img
        src={afterImage}
        alt="Premium interior by BuildBazaarX"
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Top gradient — keeps header controls legible over bright areas of the photo */}
      <div className="absolute inset-x-0 top-0 h-40 md:h-48 bg-gradient-to-b from-black/55 via-black/15 to-transparent" />
      {/* Bottom gradient — legibility for headline + CTA */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
      {/* Soft vignette for depth and a more photographic, premium feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 180px rgba(0,0,0,0.35)" }}
      />

      <div className="relative z-10 w-full px-6 md:px-12 pb-16 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-semibold uppercase tracking-widest"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          DPIIT Recognized Startup
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: "easeOut" }}
          className="font-display font-semibold text-white text-[2.5rem] leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem] max-w-4xl"
        >
          India's Professional
          <br />
          Construction Marketplace
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: "easeOut" }}
          className="mt-6 max-w-xl text-white/80 text-base md:text-lg leading-relaxed"
        >
          Verified contractors, curated designs, and quality materials —
          everything for your build, in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease: "easeOut" }}
          className="mt-9"
        >
          <Link
            to="/designs"
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-white/90 transition-colors duration-200"
          >
            Explore Designs
          </Link>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-6 right-6 md:right-12 z-10 hidden sm:flex items-center gap-2 text-white/60 text-[11px] uppercase tracking-widest"
      >
        Scroll
        <motion.span
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </motion.span>
      </motion.div>
      {/* CTA group */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link 
          to="/designs"
          data-umami-event="cta-browse-designs"
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
          data-umami-event="cta-hire-professional"
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
