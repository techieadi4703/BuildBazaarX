import React from 'react';
import { motion } from 'framer-motion';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
  label?: string;
}

export const BeforeAfterSlider = ({ beforeImage, afterImage, className = '', label = 'Architectural Render' }: BeforeAfterSliderProps) => {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Before Image (Background) */}
      <img
        loading="eager" fetchPriority="high"
        src={beforeImage}
        alt={`${label} - Before`}
        className="absolute inset-0 w-full h-full object-cover rounded-lg"
      />

      {/* After Image (Foreground, revealed from top to bottom) */}
      <motion.div
        className="absolute inset-0 w-full h-full rounded-lg z-10 overflow-hidden"
        animate={{ clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)", "inset(0 0 100% 0)"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <img
          loading="eager" fetchPriority="high"
          src={afterImage}
          alt={`${label} - After`}
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
        />
      </motion.div>

      {/* Horizontal scan line effect */}
      <motion.div 
        className="absolute left-0 right-0 h-[2px] bg-[#C5A572] z-20 shadow-[0_0_15px_rgba(197,165,114,0.8)] pointer-events-none"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};
