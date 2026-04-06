import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface Bubble {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
  color: "primary" | "accent" | "muted";
  driftX: number;
  driftY: number;
}

interface FloatingBubblesProps {
  count?: number;
  className?: string;
  palette?: "brand" | "neutral";
}

export const FloatingBubbles: React.FC<FloatingBubblesProps> = ({
  count = 14,
  className = "",
  palette = "brand",
}) => {
  const bubbles = useMemo<Bubble[]>(() => {
    return Array.from({ length: count }).map((_, i) => {
      const seed = (i * 137 + 83) % 100;
      const size = 150 + (seed % 150); // Make them larger and more blurred for a premium feel
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = Math.random() * 10;
      const duration = 20 + Math.random() * 20;
      const opacity = 0.05 + (seed % 10) * 0.01;
      const colorOptions: Bubble["color"][] =
        palette === "brand" ? ["primary", "accent", "muted"] : ["muted", "muted", "muted"];
      const color = colorOptions[i % colorOptions.length];
      
      return {
        id: i,
        size,
        x,
        y,
        delay,
        duration,
        opacity,
        color,
        driftX: Math.random() * 200 - 100,
        driftY: Math.random() * 200 - 100,
      };
    });
  }, [count, palette]);

  const getColorClass = (color: Bubble["color"]) => {
    switch (color) {
      case "primary": return "bg-primary";
      case "accent": return "bg-accent";
      case "muted": return "bg-foreground";
    }
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    >
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className={`absolute rounded-full blur-[80px] ${getColorClass(b.color)}`}
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x}%`,
            top: `${b.y}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            x: [0, b.driftX, 0],
            y: [0, b.driftY, 0],
            opacity: [b.opacity * 0.5, b.opacity, b.opacity * 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
