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
    <section className="relative overflow-hidden bg-secondary min-h-[90vh] flex items-center">
      {/* Floating Bubbles */}
      <FloatingBubbles count={16} palette="brand" />

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div 
            className="text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Home className="w-4 h-4" />
              </motion.div>
              India's Trusted Home Solutions Platform
            </motion.span>
            
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight"
            >
              Build Your{" "}
              <span className="text-shimmer">Dream Home</span>{" "}
              With Confidence
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              All-in-one platform for home designs, skilled workers, and quality raw materials. 
              From concept to completion, we've got you covered.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" asChild className="rounded-full text-base px-8 shadow-lg group">
                <Link to="/designs">
                  Explore Designs
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </motion.span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base px-8 border-2 transition-all duration-300">
                <Play className="mr-2 w-5 h-5 fill-primary text-primary" />
                Watch How It Works
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </motion.div>
                Verified Workers
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                  <Wrench className="w-5 h-5 text-accent" />
                </motion.div>
                Quality Materials
              </div>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div 
            className="relative"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-2xl z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
            >
              <motion.img
                src={heroImage}
                alt="Modern home interior"
                className="w-full h-auto object-cover aspect-[4/3]"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
            
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-xl p-6 border border-border z-20"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-4xl font-bold text-primary mb-1">500+</p>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Design Templates</p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute -top-6 -right-6 bg-card rounded-xl shadow-xl p-6 border border-border z-20"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <p className="text-4xl font-bold text-accent mb-1">200+</p>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Verified Workers</p>
              </motion.div>
            </motion.div>

            {/* Decorative background shape */}
            <motion.div 
              className="absolute -inset-4 bg-primary/5 rounded-3xl -z-10"
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
