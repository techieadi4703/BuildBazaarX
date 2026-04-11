import React from "react";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "BuildBazaarX provided unparalleled clarity in construction. Their technical approach and transparent reporting are unmatched.",
    author: "Rajesh Sharma, Mumbai",
    projectId: "B2X-MUM-422",
    status: "Completed",
  },
  {
    quote: "The platform's data-driven process made customizing our interior design seamless and predictable.",
    author: "Priya Patel, Bengaluru",
    projectId: "B2X-BLR-733",
    status: "In Progress",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-[#0B132B] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <Reveal width="100%" direction="up">
          <div className="text-center mb-20">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase">
              VERIFIED <span className="text-[#C5A572] font-serif italic font-normal">TESTIMONY</span>
            </h2>
          </div>
        </Reveal>

        {/* Testimonial List */}
        <div className="max-w-4xl mx-auto flex flex-col gap-16">
          <Reveal width="100%" staggerChildren={0.15}>
            {testimonials.map((testimonial, index) => (
              <RevealItem key={index}>
                <div className="flex flex-col items-center text-center px-4">
                  
                  {/* Gold Quote Mark */}
                  <div className="text-[#C5A572] text-6xl md:text-8xl font-serif leading-none mb-6 h-12 md:h-16 flex items-center justify-center">
                    “
                  </div>
                  
                  {/* Quote Text */}
                  <p className="text-white/90 text-xl md:text-3xl font-serif italic leading-relaxed mb-8 max-w-3xl">
                    "{testimonial.quote}"
                  </p>
                  
                  {/* Author Name */}
                  <div className="text-white/70 text-sm md:text-base font-medium tracking-wide mb-2">
                    — {testimonial.author}
                  </div>
                  
                  {/* Monospace Tech Footer */}
                  <div className="text-[#C5A572]/70 text-[10px] md:text-xs font-mono uppercase tracking-widest">
                    Project ID: {testimonial.projectId}, Status: {testimonial.status}.
                  </div>

                  {/* Divider (except last item) */}
                  {index < testimonials.length - 1 && (
                    <motion.div 
                      className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-16" 
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  )}

                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>

      </div>
    </section>
  );
};
