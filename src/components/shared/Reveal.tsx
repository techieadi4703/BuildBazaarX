import React, { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  staggerChildren?: number;
  className?: string; // Added className
}

export const Reveal: React.FC<RevealProps> = ({ 
  children, 
  width = "fit-content", 
  delay = 0,
  direction = "up",
  distance = 50,
  duration = 0.5,
  staggerChildren = 0,
  className = "" // Added className
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  const variants: Variants = {
    hidden: { 
      opacity: 0,
      x: direction === "left" ? -distance : direction === "right" ? distance : 0,
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
      scale: direction === "none" ? 0.95 : 1
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      scale: 1,
      transition: { 
        duration, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: staggerChildren > 0 ? staggerChildren : undefined
      } 
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "visible" }} className={className}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Also export a staggered child wrapper
export const RevealItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return <motion.div variants={itemVariants} className={className}>{children}</motion.div>;
};
