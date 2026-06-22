import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

import {
  woodPlanksImg,
  luxuryPaintImg,
  italianMarbleImg,
  smartSwitchImg,
  asianPaintsImg,
  godrejLockImg,
  jaquarFaucetImg,
  rrKabelImg,
  cdnImg,
} from "@/lib/cdnImages";

const products = [
  {
    brand: "Bhandari Marble",
    discount: "13%\nOFF",
    image: italianMarbleImg,
    name: "Statuario Italian Marble",
    specs: ["Slab Size: 8x4 ft", "18mm thickness", "Premium Grade"],
  },
  {
    brand: "Schneider Electric",
    discount: "13%\nOFF",
    image: smartSwitchImg,
    name: "Wiser Smart Switch",
    specs: ["Glass Touch Panel", "WiFi Enabled", "Premium Build"],
  },
  {
    brand: "Jotun",
    discount: "14%\nOFF",
    image: luxuryPaintImg,
    name: "Lady Design Pearl",
    specs: ["20 Liters", "Premium Texture", "Washable"],
  },
  {
    brand: "Premium Timber",
    discount: "10%\nOFF",
    image: woodPlanksImg,
    name: "Burmese Teak Wood Planks",
    specs: ["100% Solid Wood", "Kiln Dried", "Termite Resistant"],
  },
  {
    brand: "Asian Paints",
    discount: "15%\nOFF",
    image: asianPaintsImg,
    name: "Royale Play Texture",
    specs: ["20 Liters", "Washable", "Rich Finish"],
  },
  {
    brand: "Godrej",
    discount: "10%\nOFF",
    image: godrejLockImg,
    name: "Digital Smart Locker",
    specs: ["Biometric Access", "Anti-theft Alarm", "1 Yr Warranty"],
  },
];

export const MaterialsSection = () => {
  return (
    <section className="py-12 bg-[var(--bg-surface)] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <Reveal width="100%" direction="up">
          <div className="text-center mb-8 px-4">
            <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)] tracking-widest uppercase mb-3">
              Top Materials Collection
            </h2>
            <p className="text-[var(--text-secondary)] text-sm font-medium">
              Explore our handpicked selection of premium materials for your project.
            </p>
          </div>
        </Reveal>

        <Reveal width="100%" staggerChildren={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 max-w-[1400px] px-4 mx-auto mb-8">
            {products.map((product, index) => (
              <RevealItem key={index}>
                <Link to="/materials">
                  <motion.div whileHover={{ y: -5 }} className="h-full">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-sm p-4 h-full flex flex-col hover:border-[var(--accent-warm)]/30 transition-colors shadow-sm hover:shadow-md">
                      {/* Brand Header */}
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-wider">
                          {product.brand}
                        </span>
                        <div className="bg-[var(--accent-warm)] text-[var(--text-primary)] text-[8px] font-black p-1.5 leading-none text-center rounded-sm">
                          {product.discount.split("\n").map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      </div>

                      {/* Image */}
                      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded p-4 mb-6 flex-grow flex items-center justify-center">
                        <img
                          src={cdnImg(product.image, 200)}
                          alt={product.brand}
                          loading="lazy"
                          decoding="async"
                          width={200}
                          height={128}
                          className="w-full h-auto object-contain max-h-32"
                        />
                      </div>

                      {/* Specs */}
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)] text-sm mb-2">
                          {product.name}
                        </h4>
                        <ul className="text-[var(--text-secondary)] text-[10px] space-y-1 ml-3 list-disc">
                          {product.specs.map((spec, i) => (
                            <li
                              key={i}
                              className="pl-1 leading-snug whitespace-pre-wrap"
                            >
                              {spec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </RevealItem>
            ))}
          </div>
        </Reveal>

        {/* CTA Button */}
        <Reveal width="100%" direction="up" delay={0.2}>
          <div className="text-center">
            <Button
              asChild
              size="sm"
              className="bg-[var(--accent-warm)] hover:bg-[var(--accent-warm-hover)] text-[var(--text-primary)] border-none px-6 py-2 text-[10px] uppercase font-bold tracking-wider rounded-sm shadow-sm transition-colors"
            >
              <Link to="/materials">View Material Catalog</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
