import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { motion } from "framer-motion";
import { fullhomeImage, cdnImg } from "@/lib/cdnImages";

export const PopularDesignsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-[var(--bg-base)]">
      <div className="container mx-auto px-6 md:px-8 max-w-6xl">
        <Reveal width="100%" direction="up">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-3">
                Featured
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">
                Design Catalogue
              </h2>
            </div>
            <Link
              to="/designs"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-warm)] transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal width="100%" direction="up" delay={0.1}>
          <Link to="/designs">
            <motion.div
              whileHover={{ scale: 1.005 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="group relative w-full h-[70vh] min-h-[420px] max-h-[640px] rounded-2xl overflow-hidden"
            >
              <img
                src={cdnImg(fullhomeImage, 1400)}
                alt="Full Home Interior — signature design catalogue"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
                  Full Home Interior
                </p>
                <h3 className="font-display text-white text-2xl md:text-4xl font-semibold tracking-tight max-w-xl mb-6">
                  Complete interior design, curated end‑to‑end.
                </h3>
                <span className="inline-flex items-center gap-2 text-white text-sm font-medium w-fit border-b border-white/40 pb-1 group-hover:border-white transition-colors">
                  Explore the full catalogue
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </motion.div>
          </Link>
        </Reveal>

        <Reveal width="100%" direction="up" delay={0.2}>
          <div className="sm:hidden text-center mt-8">
            <Link
              to="/designs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-warm)] transition-colors"
            >
              View all designs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
