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
} from "@/lib/rawMaterialsData";

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
];

export const MaterialsSection = () => {
  return (
    <section className="py-12 bg-[#F4F0EA] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <Reveal width="100%" direction="up">
          <div className="text-center mb-8 px-4">
            <h2 className="text-xl md:text-2xl font-black text-[#0B132B] tracking-widest uppercase mb-3">
              VERIFIED MATERIALS: INVENTORY SHOWCASE
            </h2>
            <p className="text-[#0B132B]/60 text-sm font-medium">
              Premium brand cards update protocol and available commit to
              materials initiatives.
            </p>
          </div>
        </Reveal>

        <Reveal width="100%" staggerChildren={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
            {products.map((product, index) => (
              <RevealItem key={index}>
                <Link to="/materials">
                  <motion.div whileHover={{ y: -5 }} className="h-full">
                    <div className="bg-[#F8F6F1] border border-[#0B132B]/5 rounded-sm p-4 h-full flex flex-col hover:border-[#C5A572]/30 transition-colors shadow-sm hover:shadow-md">
                      {/* Brand Header */}
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-bold text-[#0B132B] text-xs uppercase tracking-wider">
                          {product.brand}
                        </span>
                        <div className="bg-[#E6D5B8] text-[#0B132B] text-[8px] font-black p-1.5 leading-none text-center rounded-sm">
                          {product.discount.split("\n").map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      </div>

                      {/* Image */}
                      <div className="bg-white border border-[#0B132B]/5 rounded p-4 mb-6 flex-grow flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.brand}
                          loading="lazy"
                          width={200}
                          height={128}
                          className="w-full h-auto object-contain mix-blend-multiply max-h-32"
                        />
                      </div>

                      {/* Specs */}
                      <div>
                        <h4 className="font-bold text-[#0B132B] text-sm mb-2">
                          {product.name}
                        </h4>
                        <ul className="text-[#0B132B]/70 text-[10px] space-y-1 ml-3 list-disc">
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
              className="bg-[#E6D5B8] hover:bg-[#DBC49D] text-[#0B132B] border-none px-6 py-2 text-[10px] uppercase font-bold tracking-wider rounded-sm shadow-sm transition-colors"
            >
              <Link to="/materials">View Material Catalog</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
