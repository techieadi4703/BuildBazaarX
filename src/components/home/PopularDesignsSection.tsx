import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { livingroomImage } from "@/lib/cdnImages"; // Re-using as bathroom/garden placeholder if needed
import { kitchenImage, bedroomImage, fullhomeImage } from "@/lib/cdnImages";

const designCategories = [
  {
    id: 1,
    title: "MODULAR KITCHEN",
    image: kitchenImage,
    categoryId: "CATEGORY_INDEX: 001",
    techSpec: "Efficiency Score: 98A",
  },
  {
    id: 2,
    title: "FULL HOME INTERIOR",
    image: fullhomeImage,
    categoryId: "CATEGORY_INDEX: 002",
    techSpec: "Integration Level: High",
  },
  {
    id: 3,
    title: "SMART BATHROOM",
    image: bedroomImage, // placeholder
    categoryId: "CATEGORY_INDEX: 003",
    techSpec: "Water Saving: 50A",
  },
  {
    id: 4,
    title: "TERRACE GARDEN",
    image: livingroomImage, // placeholder
    categoryId: "CATEGORY_INDEX: 004",
    techSpec: "Floor Cover: 80%",
  },
];

export const PopularDesignsSection = () => {
  const isMobile = useIsMobile();

  return (
    <section className="py-12 bg-[#0B132B] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        <Reveal width="100%" direction="up">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase">
              POPULAR DESIGNS: CATEGORY_INDEX
            </h2>
          </div>
        </Reveal>

        {/* 2x2 Grid Visualization */}
        <Reveal width="100%" staggerChildren={0.1}>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {designCategories.map((category, index) => (
              <RevealItem key={category.id}>
                <Link to="/designs">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="bg-[#131B2E] border border-white/10 rounded-xl overflow-hidden hover:border-[#C5A572]/50 transition-colors duration-500 shadow-2xl">
                      {/* Image Container with Tech Overlays */}
                      <div className="relative h-64 md:h-72 overflow-hidden bg-[#0A1128] p-2">
                         <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-white/80 border border-white/10">
                           {category.categoryId}
                         </div>
                         <motion.img
                           src={category.image}
                           alt={category.title}
                           initial={{ 
                             opacity: 0.5, 
                             filter: isMobile ? "grayscale(100%) blur(2px)" : "grayscale(100%)" 
                           }}
                           whileInView={isMobile ? { opacity: 1, filter: "grayscale(0%) blur(0px)" } : {}}
                           whileHover={!isMobile ? { opacity: 1, filter: "grayscale(0%)" } : {}}
                           viewport={{ amount: 0.7, once: false }}
                           transition={{ 
                             duration: isMobile ? 1.2 : 0.4, 
                             delay: isMobile ? 0.1 : 0, 
                             ease: "easeOut" 
                           }}
                           className="w-full h-full object-cover rounded transition-transform duration-700 md:group-hover:scale-105"
                         />
                         {/* Scan line decoration */}
                         <div className="absolute bottom-2 left-2 right-2 h-[2px] bg-[#C5A572]/40" />
                      </div>

                      {/* Card Footer */}
                      <div className="p-5 flex justify-between items-end border-t border-white/5">
                        <div>
                          <h3 className="font-black text-lg text-white mb-2 uppercase tracking-wide">
                            {category.title}
                          </h3>
                          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                            {category.categoryId.split(':')[0]}: {category.categoryId.split(':')[1]}
                          </p>
                        </div>
                        <div className="text-[10px] font-mono text-[#C5A572] uppercase text-right">
                          {category.techSpec}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Link>
              </RevealItem>
            ))}
          </div>
        </Reveal>

        <Reveal width="100%" direction="up" delay={0.3}>
          <div className="text-center mt-8">
            <Button asChild size="sm" className="bg-[#C5A572]/10 hover:bg-[#C5A572] border border-[#C5A572]/50 text-[#C5A572] hover:text-[#0B132B] px-8 uppercase tracking-widest text-xs font-bold transition-all">
              <Link to="/designs">
                View All Designs
              </Link>
            </Button>
          </div>
        </Reveal>

      </div>
    </section>
  );
};
