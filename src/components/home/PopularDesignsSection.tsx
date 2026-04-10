import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";
import kitchenImage from "@/assets/kitchen-design.jpg";
import bedroomImage from "@/assets/bedroom-design.jpg";
import livingroomImage from "@/assets/livingroom-design.jpg";
import wardrobeImage from "@/assets/wardrobe-design.jpg";
import fullhomeImage from "@/assets/fullhome-design.jpg";

const designCategories = [
  {
    id: 1,
    title: "Modular Kitchen",
    image: kitchenImage,
    designs: "120+ Designs",
    startingPrice: "₹1.5L",
  },
  {
    id: 2,
    title: "Bedroom",
    image: bedroomImage,
    designs: "85+ Designs",
    startingPrice: "₹80K",
  },
  {
    id: 3,
    title: "Living Room",
    image: livingroomImage,
    designs: "95+ Designs",
    startingPrice: "₹70K",
  },
  {
    id: 4,
    title: "Wardrobe",
    image: wardrobeImage,
    designs: "60+ Designs",
    startingPrice: "₹45K",
  },
  {
    id: 5,
    title: "Full Home Interior",
    image: fullhomeImage,
    designs: "150+ Packages",
    startingPrice: "₹5L",
  },
];

export const PopularDesignsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background technical dots */}
      <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <Reveal width="100%" direction="up" distance={30}>
          <div className="text-center mb-16 px-4">
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1 bg-on-surface/5 text-on-surface/60 rounded-full text-[10px] font-mono uppercase tracking-[0.3em] mb-6"
              whileHover={{ scale: 1.05 }}
            >
              Category_Index
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-serif text-on-surface mb-6 tracking-tight">
              Popular Design <span className="italic text-secondary">Archetypes</span>.
            </h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Systematic design solutions crafted for modern Indian living.
            </p>
          </div>
        </Reveal>

        {/* Design Grid */}
        <Reveal width="100%" staggerChildren={0.08}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {designCategories.map((category, index) => (
              <RevealItem key={category.id}>
                <Link key={category.id} to="/designs">
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="h-full"
                  >
                    <Card className="group overflow-hidden border-on-surface/5 hover:border-secondary/40 transition-all duration-500 hover:shadow-2xl rounded-2xl h-full bg-surface">
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <motion.img
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                        
                        {/* Technical Step Label */}
                        <div className="absolute top-4 left-4 font-mono text-[9px] text-white/40 tracking-widest bg-black/40 backdrop-blur-md px-2 py-1 rounded">
                          CAT_0{index + 1}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="font-serif text-2xl mb-2 italic tracking-tight">{category.title}</h3>
                          <div className="flex justify-between items-center text-xs font-mono tracking-wider text-white/70">
                            <span>{category.designs}</span>
                            <span className="text-secondary-container font-bold">
                              {category.startingPrice}+
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Link>
              </RevealItem>
            ))}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal width="100%" direction="up" delay={0.3}>
          <div className="text-center mt-16">
            <Button asChild size="lg" className="rounded-xl px-12 group secondary-gradient glow-secondary border-none h-16 text-lg tracking-wide">
              <Link to="/designs">
                <span className="relative z-10 flex items-center gap-3">
                  Explore Full Catalog
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
