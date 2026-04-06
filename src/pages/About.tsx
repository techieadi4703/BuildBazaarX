import { Link } from "react-router-dom";
import { 
  Home, 
  Package, 
  Hammer, 
  Calculator, 
  CheckCircle,
  Target,
  Eye,
  Award,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

const offerings = [
  { icon: Home, title: "Home & Interior Designs", description: "500+ professional design templates" },
  { icon: Hammer, title: "On-site Execution", description: "Skilled workers for quality work" },
  { icon: Package, title: "Raw Materials & Supplies", description: "Quality materials from trusted brands" },
  { icon: Calculator, title: "Cost Estimation", description: "Transparent pricing & consultation" },
];

const whyChoose = [
  "One Platform — Designs, Workers & Materials",
  "Verified Skilled Professionals",
  "Trusted Material Brands",
  "Transparent Pricing",
  "End-to-End Project Support",
  "Customer-Focused Approach",
];

const milestones = [
  { title: "Shortlisted at IIT Bombay", subtitle: "Eureka! 2025" },
  { title: "Selected at IIT Delhi", subtitle: "E-Cell / EDC 2026" },
  { title: "Growing Network", subtitle: "Suppliers & Skilled Workers" },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary/30 py-24 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <Reveal width="100%" direction="up">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8"
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-7xl font-black text-foreground mb-8 tracking-tight leading-tight">
                Architecting the <span className="text-primary italic">Future</span> of Construction
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-xl md:text-2xl font-medium leading-relaxed">
                BuildBazaarX is an all-in-one ecosystem for home building — merging expert designs, verified execution, and premium materials.
              </p>
            </div>
          </Reveal>
        </div>
        
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-[100px]"
        />
      </section>

      {/* Company Overview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Reveal width="100%" direction="up">
              <div className="text-center mb-16">
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Our Methodology</h2>
                <h3 className="text-3xl md:text-5xl font-black text-foreground mb-8 tracking-tight">Redefining Homebuilding</h3>
                <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed font-medium">
                  BuildBazaarX emerged to eliminate the friction in traditional construction. We’ve built a transparent digital bridge that connects homeowners with everything they need — from blueprint to final brick.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <Reveal width="100%" direction="up" delay={0.1}>
              <Card className="border-border/50 shadow-2xl bg-background/80 backdrop-blur-xl rounded-[3rem] overflow-hidden group hover:border-primary/20 transition-all duration-500">
                <CardContent className="p-12">
                  <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <Target className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-6 tracking-tight">Our Mission</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                    To make home building simple, affordable, and stress-free by orchestrating a verified network of skilled labor, trusted suppliers, and state-of-the-art designs.
                  </p>
                </CardContent>
              </Card>
            </Reveal>
            <Reveal width="100%" direction="up" delay={0.2}>
              <Card className="border-border/50 shadow-2xl bg-background/80 backdrop-blur-xl rounded-[3rem] overflow-hidden group hover:border-accent/20 transition-all duration-500">
                <CardContent className="p-12">
                  <div className="w-20 h-20 bg-accent/10 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                    <Eye className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-6 tracking-tight">Our Vision</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                    To be the gold standard in construction technology across India, empower millions of skilled workers, and turn "dream homes" into accessible realities.
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">The BuildBazaarX Edge</h2>
              <h3 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Comprehensive Solutions</h3>
            </div>
          </Reveal>
          
          <Reveal width="100%" staggerChildren={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {offerings.map((offering, index) => (
                <RevealItem key={index}>
                  <motion.div whileHover={{ y: -10 }}>
                    <Card className="border-transparent bg-secondary/20 rounded-[2.5rem] hover:bg-background hover:shadow-2xl transition-all duration-500 overflow-hidden h-full text-center">
                      <CardContent className="p-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                          <offering.icon className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-4 leading-tight">{offering.title}</h3>
                        <p className="text-muted-foreground font-medium">{offering.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <Reveal width="100%" direction="up">
            <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-20 tracking-tight">The BuildBazaarX Promise</h2>
          </Reveal>
          
          <Reveal width="100%" staggerChildren={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {whyChoose.map((item, index) => (
                <RevealItem key={index}>
                  <motion.div 
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="flex items-center gap-5 p-8 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 text-white group cursor-default"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg leading-tight">{item}</span>
                  </motion.div>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        </div>
        
        {/* Animated Mesh Gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />
      </section>

      {/* Milestones */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-20">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Our Progress</h2>
              <h3 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Milestones Achieved</h3>
            </div>
          </Reveal>
          
          <Reveal width="100%" staggerChildren={0.15}>
            <div className="flex flex-wrap justify-center gap-10 max-w-6xl mx-auto">
              {milestones.map((milestone, index) => (
                <RevealItem key={index}>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 2 : -2 }}
                    className="flex flex-col items-center p-12 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border/50 text-center min-w-[300px]"
                  >
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-8 shadow-xl">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2 leading-tight">{milestone.title}</h3>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">{milestone.subtitle}</p>
                  </motion.div>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 pb-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto bg-primary rounded-[4rem] p-16 md:p-24 text-center shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                Ready to Build Your <br/><span className="text-accent underline decoration-white/30 underline-offset-8">Dream Legacy?</span>
              </h2>
              <p className="text-white/80 text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of homeowners who trust BuildBazaarX for a stress-free construction experience.
              </p>
              <Button size="lg" variant="secondary" asChild className="h-20 rounded-2.5xl px-12 text-xl font-black shadow-2xl group overflow-hidden">
                <Link to="/contact">
                  Start Your Consultation
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </div>
            
            {/* Background Decorative patterns */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
