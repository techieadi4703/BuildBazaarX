import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Home, Wrench, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingBubbles } from "@/components/ui/FloatingBubbles";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-interior.jpg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const imageVariants = {
  hidden: { opacity: 0, x: 50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
  }
};

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-primary-container min-h-[95vh] flex items-center">
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 bg-blueprint opacity-[0.15] pointer-events-none" />
      
      {/* Decorative Brand Gradient */}
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-tertiary-container/30 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div 
            className="text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/90 text-sm font-medium mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <span className="tracking-[0.2em] uppercase text-[10px] font-bold">Standard of Excellence</span>
              <span className="w-[1px] h-4 bg-white/20 mx-1" />
              <span className="text-white/60">India's Premum Home Solutions</span>
            </motion.div>
            
            <motion.h1
              variants={itemVariants}
              className="text-display-lg md:text-[5rem] text-white mb-8 leading-[1.1] tracking-tight font-serif"
            >
              Architectural <span className="text-secondary-container italic decoration-secondary/30 underline-offset-8">Precision</span>. 
              <br />
              Total Transparency.
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-xl text-white/70 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans"
            >
              BuildBazaarX brings a systematic, data-driven approach to home construction. 
              Browse 500+ designs, hire verified professionals, and source elite materials.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Button size="lg" variant="action" asChild className="group secondary-gradient glow-secondary border-none px-8 py-7 text-lg rounded-xl">
                <Link to="/designs" className="flex items-center gap-3">
                  Start Your Blueprint
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 px-8 py-7 text-lg border border-white/20 rounded-xl backdrop-blur-sm">
                <Play className="mr-3 w-5 h-5 fill-secondary text-secondary" />
                Experience the Process
              </Button>
            </motion.div>

            {/* Technical Labels */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-8 mt-16 justify-center lg:justify-start">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-mono">01. Service Path</span>
                <span className="text-sm text-white/90 font-medium">Verified Professionals</span>
              </div>
              <div className="w-[1px] h-10 bg-white/10 hidden sm:block" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-mono">02. Logistics</span>
                <span className="text-sm text-white/90 font-medium">Quality Check Materials</span>
              </div>
              <div className="w-[1px] h-10 bg-white/10 hidden sm:block" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-mono">03. Framework</span>
                <span className="text-sm text-white/90 font-medium">End-to-End Support</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div 
            className="relative lg:ml-10"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Visual Container */}
            <div className="relative rounded-[2rem] p-4 bg-white/5 border border-white/10 backdrop-blur-sm">
              <motion.div 
                className="relative rounded-[1.5rem] overflow-hidden shadow-2xl z-10"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.5 }}
              >
                <motion.img
                  src={heroImage}
                  alt="Architecture Interior"
                  className="w-full h-auto object-cover aspect-[4/5] lg:aspect-[3/4]"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-container/80 via-transparent to-transparent" />
              </motion.div>

              {/* Technical Annotations */}
              <div className="absolute top-10 -left-6 z-20 hidden xl:block">
                <div className="bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-lg flex flex-col gap-2 shadow-2xl">
                  <div className="flex items-center gap-4 text-white/60 font-mono text-[10px]">
                    <span>LAT: 28.6139° N</span>
                    <span>LNG: 77.2090° E</span>
                  </div>
                  <div className="h-[1px] bg-white/10" />
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="text-xs text-white font-medium uppercase tracking-wider">Site Verification: Active</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Cards - Premium Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="glass-morphism absolute -bottom-8 -left-8 p-8 rounded-2xl shadow-ambient z-30"
            >
              <p className="text-5xl font-serif text-white mb-2 font-bold tracking-tighter">500+</p>
              <p className="text-[10px] text-secondary font-mono uppercase tracking-[0.2em] font-bold">Design Assets</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="glass-morphism absolute -top-8 -right-8 p-8 rounded-2xl shadow-ambient z-30"
            >
              <p className="text-5xl font-serif text-secondary mb-2 font-bold tracking-tighter">200+</p>
              <p className="text-[10px] text-white/60 font-mono uppercase tracking-[0.2em] font-bold">Verified Leads</p>
            </motion.div>

            {/* Decorative Orbits */}
            <div className="absolute -inset-10 border border-white/5 rounded-full pointer-events-none -z-10 animate-spin-slow" />
            <div className="absolute -inset-20 border border-white/5 rounded-full pointer-events-none -z-10 animate-spin-slow direction-reverse opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
