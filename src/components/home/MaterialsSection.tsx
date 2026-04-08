import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Truck, IndianRupee, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

import plywoodImage from "@/assets/products/plywood.jpg";
import paintImage from "@/assets/products/paint.jpg";
import tilesImage from "@/assets/products/tiles.jpg";
import ledImage from "@/assets/products/led-light.jpg";
import cementImage from "@/assets/products/cement.jpg";
import laminateImage from "@/assets/products/laminate.jpg";

const featuredProducts = [
  {
    id: 1,
    name: "Greenply Plywood BWR Grade",
    image: plywoodImage,
    brand: "Greenply",
    price: 85,
    unit: "per sq ft",
    originalPrice: 110,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Asian Paints Royale Matt",
    image: paintImage,
    brand: "Asian Paints",
    price: 450,
    unit: "per litre",
    originalPrice: 520,
    rating: 4.7,
  },
  {
    id: 3,
    name: "Kajaria Floor Tiles",
    image: tilesImage,
    brand: "Kajaria",
    price: 65,
    unit: "per sq ft",
    originalPrice: 85,
    rating: 4.6,
  },
  {
    id: 4,
    name: "Philips LED Panel Light",
    image: ledImage,
    brand: "Philips",
    price: 850,
    unit: "per piece",
    originalPrice: 1100,
    rating: 4.8,
  },
  {
    id: 5,
    name: "UltraTech Cement PPC",
    image: cementImage,
    brand: "UltraTech",
    price: 380,
    unit: "per bag",
    originalPrice: 420,
    rating: 4.4,
  },
  {
    id: 6,
    name: "Merino Laminates",
    image: laminateImage,
    brand: "Merino",
    price: 1200,
    unit: "per sheet",
    originalPrice: 1450,
    rating: 4.5,
  },
];

const usps = [
  { icon: IndianRupee, title: "Best Price", description: "Competitive market rates" },
  { icon: BadgeCheck, title: "Verified Suppliers", description: "Trusted material partners" },
  { icon: Truck, title: "Home Delivery", description: "Doorstep delivery available" },
];

export const MaterialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <div className="container mx-auto px-4">
        {/* Header */}
        <Reveal width="100%" direction="up" distance={30}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Quality Raw Materials</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get the best deals on premium materials from India's leading brands.
            </p>
          </div>
        </Reveal>

        {/* Products Grid */}
        <Reveal width="100%" staggerChildren={0.08}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {featuredProducts.map((product) => {
              const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              return (
                <RevealItem key={product.id}>
                  <Link to="/materials">
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="h-full"
                    >
                      <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl h-full flex flex-col rounded-2xl bg-background">
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <motion.img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                          />
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full"
                          >
                            {discount}% OFF
                          </motion.div>
                        </div>
                        <CardContent className="p-4 flex-grow flex flex-col">
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">{product.brand}</p>
                          <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-300">
                            {product.name}
                          </h3>
                          <div className="mt-auto">
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-3 h-3 fill-accent text-accent" />
                              <span className="text-[10px] text-muted-foreground font-medium">{product.rating}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-lg text-foreground">₹{product.price}</span>
                              <span className="text-[10px] text-muted-foreground line-through font-medium">₹{product.originalPrice}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium">{product.unit}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </RevealItem>
              );
            })}
          </div>
        </Reveal>

        {/* USPs */}
        <Reveal width="100%" staggerChildren={0.15}>
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {usps.map((usp, index) => (
              <RevealItem key={index}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card className="border-border hover:border-primary/50 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-xl bg-background overflow-hidden relative group">
                    <CardContent className="flex items-center gap-5 p-6 z-10 relative">
                      <motion.div 
                        className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors duration-300"
                        whileHover={{ rotate: 5 }}
                      >
                        <usp.icon className="w-7 h-7 text-accent group-hover:text-white transition-colors duration-300" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground mb-1">{usp.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{usp.description}</p>
                      </div>
                    </CardContent>
                    <motion.div 
                      className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                      initial={false}
                    />
                  </Card>
                </motion.div>
              </RevealItem>
            ))}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal width="100%" direction="up" delay={0.3}>
          <div className="text-center">
            <Button asChild size="lg" className="rounded-full px-12 shadow-2xl group relative overflow-hidden">
              <Link to="/materials">
                <span className="relative z-10 flex items-center">
                  Browse All Materials
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
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