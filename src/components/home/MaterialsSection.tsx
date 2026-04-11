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
    <section className="py-20 md:py-28 bg-surface-container-low relative overflow-hidden">
      {/* Background technical dots */}
      <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <Reveal width="100%" direction="up" distance={30}>
          <div className="text-center mb-16">
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-mono uppercase tracking-[0.3em] mb-6"
              whileHover={{ scale: 1.05 }}
            >
              Hardware_Logistics
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-serif text-on-surface mb-6 tracking-tight">Quality <span className="italic text-secondary">Verified</span> Materials.</h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              Sourced directly from certified manufacturers with guaranteed authenticity.
            </p>
          </div>
        </Reveal>

        {/* Products Grid */}
        <Reveal width="100%" staggerChildren={0.06}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {featuredProducts.map((product, index) => {
              const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              return (
                <RevealItem key={product.id}>
                  <Link to="/materials">
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="h-full"
                    >
                      <Card className="group overflow-hidden border-border/50 hover:border-[#C5A572]/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] h-full flex flex-col rounded-[2rem] bg-[#F4F0EA]">
                        <div className="relative aspect-square overflow-hidden bg-white">
                          <motion.img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-all duration-500 mix-blend-multiply"
                            whileHover={{ scale: 1.15 }}
                            transition={{ duration: 0.8 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
                            <motion.div 
                              className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg ring-2 ring-destructive/20"
                            >
                              {discount}% OFF
                            </motion.div>
                            <div className="bg-black/40 backdrop-blur-md text-white/80 text-[8px] font-mono px-2 py-0.5 rounded mt-1">
                              SKU_0{index + 1}
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-5 flex-grow flex flex-col pt-6">
                          <p className="text-[10px] text-[#C5A572] font-black uppercase tracking-[0.2em] mb-2">{product.brand}</p>
                          <h3 className="text-base font-serif font-bold text-black line-clamp-2 mb-3 leading-tight transition-colors duration-300">
                            {product.name}
                          </h3>
                          <div className="mt-auto">
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-3 h-3 ${s <= Math.floor(product.rating) ? "fill-[#C5A572] text-[#C5A572]" : "fill-black/10 text-black/10"}`} />
                              ))}
                              <span className="text-[10px] text-black/40 font-mono ml-1">{product.rating}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-black text-xl text-black tracking-tighter">₹{product.price}</span>
                              <span className="text-[10px] text-black/40 line-through font-medium">₹{product.originalPrice}</span>
                            </div>
                            <p className="text-[10px] text-black/50 font-medium tracking-wide mt-1 uppercase italic">{product.unit}</p>
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
        <Reveal width="100%" staggerChildren={0.1}>
          <div className="grid sm:grid-cols-3 gap-6 mb-20">
            {usps.map((usp, index) => (
              <RevealItem key={index}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Card className="border-on-surface/5 hover:border-secondary/20 transition-all duration-500 rounded-2xl shadow-sm hover:shadow-2xl bg-white/40 backdrop-blur-md overflow-hidden group">
                    <CardContent className="flex items-center gap-6 p-8 relative z-10">
                      <motion.div 
                        className="w-16 h-16 bg-on-surface/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:glow-secondary transition-all duration-500"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <usp.icon className="w-8 h-8 text-on-surface group-hover:text-white transition-colors duration-500" />
                      </motion.div>
                      <div>
                        <h3 className="font-serif text-xl italic text-on-surface mb-1">{usp.title}</h3>
                        <p className="text-on-surface-variant/80 text-sm leading-relaxed">{usp.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </RevealItem>
            ))}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal width="100%" direction="up" delay={0.3}>
          <div className="text-center">
            <Button asChild size="lg" className="rounded-xl px-12 group secondary-gradient glow-secondary border-none h-16 text-lg tracking-wide">
              <Link to="/materials">
                <span className="relative z-10 flex items-center gap-4">
                  Full Material Inventory
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