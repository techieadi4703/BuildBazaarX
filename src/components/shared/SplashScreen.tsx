import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logoIcon } from "@/lib/cdnImages";

const MIN_DISPLAY_MS = 2200;

export const SplashScreen = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Keep the splash up briefly so the reveal reads as intentional, not a glitch.
    const timer = setTimeout(() => setVisible(false), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          {/* Premium backdrop image */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: "url('/branding_hero.webp')" }}
          />

          {/* Frosted translucent veil — white in light mode, deep charcoal in dark mode */}
          <div className="absolute inset-0 bg-white/80 dark:bg-[#05070C]/80 backdrop-blur-2xl transition-colors duration-500" />

          {/* Soft radial glow for depth */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.55), transparent 60%)",
            }}
          />
          <div className="absolute inset-0 hidden dark:block" style={{
            background: "radial-gradient(circle at 50% 45%, rgba(75,132,216,0.12), transparent 60%)",
          }} />

          {/* Hairline frame for a crafted, boutique feel */}
          <div className="absolute inset-4 md:inset-8 border border-[var(--accent)]/15 dark:border-[var(--accent-mid)]/15 pointer-events-none" />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="relative flex flex-col items-center px-6"
          >
            <motion.img
              src={logoIcon}
              alt="BuildBazaarX"
              className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_8px_24px_rgba(26,61,124,0.18)]"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-5 font-display text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]"
            >
              Build<span className="text-[var(--accent-warm)]">Bazaar</span>X
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-2 text-[11px] md:text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]"
            >
              Design &middot; Build &middot; Source
            </motion.p>

            {/* Elegant loading indicator */}
            <div className="mt-8 h-px w-40 md:w-48 bg-[var(--border-default)]/60 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-[var(--accent-warm)]"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
