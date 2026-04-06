import React from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Rajesh Sharma",
    location: "Jaipur",
    rating: 5,
    review: "BuildBazaarX made my home renovation incredibly smooth. The design options were amazing and the workers were professional. Highly recommend!",
    project: "3BHK Interior",
  },
  {
    id: 2,
    name: "Priya Gupta",
    location: "Jodhpur",
    rating: 5,
    review: "Got my modular kitchen done through BuildBazaarX. The quality of materials and workmanship exceeded my expectations. Great value for money!",
    project: "Modular Kitchen",
  },
  {
    id: 3,
    name: "Amit Verma",
    location: "Udaipur",
    rating: 5,
    review: "Transparent pricing and verified workers gave me peace of mind. The entire process from design to execution was seamless.",
    project: "Full Home Interior",
  },
];

export const TestimonialsSection = () => {
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
              Customer Stories
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-6 mb-4 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Real stories from homeowners who trusted BuildBazaarX for their dream homes.
            </p>
          </div>
        </Reveal>

        {/* Testimonials Grid */}
        <Reveal width="100%" staggerChildren={0.15}>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <RevealItem key={testimonial.id}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-full"
                >
                  <Card className="border-border/50 hover:border-primary/30 transition-all duration-500 rounded-3xl shadow-xl hover:shadow-2xl bg-card h-full group">
                    <CardContent className="p-8 h-full flex flex-col">
                      {/* Quote Icon */}
                      <motion.div 
                        initial={{ rotate: 0 }}
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="mb-6 inline-block"
                      >
                        <Quote className="w-12 h-12 text-primary/20" />
                      </motion.div>
                      
                      {/* Rating */}
                      <div className="flex gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <Star className="w-5 h-5 fill-accent text-accent" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Review */}
                      <p className="text-foreground text-lg italic leading-relaxed mb-8 flex-grow">
                        "{testimonial.review}"
                      </p>

                      {/* Customer Info */}
                      <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                        <motion.div 
                          className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 group-hover:border-primary transition-colors duration-500"
                          whileHover={{ scale: 1.1 }}
                        >
                          <span className="text-primary font-bold text-xl uppercase">
                            {testimonial.name.charAt(0)}
                          </span>
                        </motion.div>
                        <div>
                          <p className="font-bold text-lg text-foreground">{testimonial.name}</p>
                          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {testimonial.project} • {testimonial.location}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </RevealItem>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Decorative background shape */}
      <div className="absolute top-1/2 left-0 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
    </section>
  );
};
