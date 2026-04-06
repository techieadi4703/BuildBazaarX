import React from "react";
import { Palette, Calculator, Hammer } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";

const steps = [
  {
    icon: Palette,
    step: "01",
    title: "Choose a Design",
    description: "Browse through 500+ professional home and interior designs. Filter by style, budget, and room type.",
  },
  {
    icon: Calculator,
    step: "02",
    title: "Customize + Get Cost Estimate",
    description: "Personalize your chosen design and get a transparent cost breakdown including materials and labor.",
  },
  {
    icon: Hammer,
    step: "03",
    title: "Hire Workers + Buy Materials",
    description: "Connect with verified workers for on-site execution and order quality materials at best prices.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <Reveal width="100%" direction="up" distance={30}>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <motion.span 
              className="text-primary font-bold text-sm uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              Simple Process
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-6 mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              From design selection to project completion in 3 simple steps
            </p>
          </div>
        </Reveal>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line — draws on scroll */}
          <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-0.5 bg-border -z-10">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
            />
          </div>
          
          <Reveal width="100%" staggerChildren={0.3}>
            <div className="grid md:grid-cols-3 gap-12 relative">
              {steps.map((step, index) => (
                <RevealItem key={index}>
                  <motion.div 
                    className="relative text-center group"
                    whileHover={{ y: -5 }}
                  >
                    {/* Icon Container */}
                    <div className="relative inline-flex mb-8">
                      <motion.div 
                        className="w-24 h-24 bg-background rounded-full flex items-center justify-center border-4 border-primary/20 shadow-xl relative z-10 group-hover:border-primary transition-colors duration-500"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                      >
                        <step.icon className="w-10 h-10 text-primary" />
                      </motion.div>
                      
                      <motion.span 
                        className="absolute -top-2 -right-2 w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-lg shadow-lg z-20"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                      >
                        {step.step}
                      </motion.span>

                      {/* Ripple effect */}
                      <motion.div 
                        className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 1 }}
                      />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
    </section>
  );
};
