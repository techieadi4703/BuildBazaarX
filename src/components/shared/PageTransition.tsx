import React, { Suspense } from "react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

const Fallback = () => (
  <div className="h-screen w-full flex items-center justify-center">
    <div className="w-8 h-8 animate-spin rounded-full border-4 border-[var(--accent-warm)] border-t-transparent"></div>
  </div>
);

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ 
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for premium feel
      }}
    >
      <Suspense fallback={<Fallback />}>
        {children}
      </Suspense>
    </motion.div>
  );
};
