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
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <Reveal width="100%" direction="up" distance={30}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Popular Design Categories</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our most loved interior design styles crafted by top designers.
            </p>
          </div>
        </Reveal>

        {/* Design Grid */}
        <Reveal width="100%" staggerChildren={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {designCategories.map((category) => (
              <RevealItem key={category.id}>
                <Link key={category.id} to="/designs">
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl rounded-2xl">
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <motion.img
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="font-bold text-xl mb-1">{category.title}</h3>
                          <div className="flex justify-between items-center text-sm font-medium text-white/90">
                            <span>{category.designs}</span>
                            <span className="text-accent-foreground bg-accent/90 px-2 py-0.5 rounded text-xs">
                              From {category.startingPrice}
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
          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-full px-10 shadow-xl group overflow-hidden relative">
              <Link to="/designs">
                <span className="relative z-10 flex items-center">
                  View All Designs
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div 
                  className="absolute inset-0 bg-primary-foreground/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
