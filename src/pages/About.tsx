import { Helmet } from "react-helmet-async";
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
  Sparkles,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Building
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

const offerings = [
  { icon: Home, title: "Home & Interior Designs", description: "500+ professional design templates strictly vetted for modern usability." },
  { icon: Hammer, title: "On-site Execution", description: "Certified, background-checked skilled workers to ensure zero-defect quality." },
  { icon: Package, title: "Raw Materials & Supplies", description: "Direct-to-site supply chain from globally trusted manufacturing brands." },
  { icon: Calculator, title: "Algorithmic Estimation", description: "Transparent, real-time cost projections eliminating budget overruns." },
];

const whyChoose = [
  "Unified Procurement Protocol",
  "Zero-Tolerance Vendor Vetting",
  "Real-Time Material Tracking",
  "Institutional-Grade Transparency",
  "End-to-End Project Authority",
  "Customer-Centric Execution",
];

const milestones = [
  { title: "IIT Bombay Incubation", subtitle: "Eureka! 2025 - Shortlisted", year: "2025" },
  { title: "IIT Delhi Recognition", subtitle: "E-Cell / EDC Selection", year: "2026" },
  { title: "Expanding the Grid", subtitle: "National Supplier Network Active", year: "2027" },
];

const About = () => {
  return (
    <Layout>
      <Helmet>
        <title>About Us | BuildBazaarX – India's Construction Marketplace</title>
        <meta name="description" content="Learn how BuildBazaarX is architecting the future of construction. Our mission: unify home designs, verified professionals, and raw material supply into one seamless platform." />
        <link rel="canonical" href="https://buildbazaarx.com/about" />
        <meta property="og:url" content="https://buildbazaarx.com/about" />
        <meta property="og:title" content="About Us | BuildBazaarX" />
        <meta property="og:description" content="Hear the BuildBazaarX story — incubated at IIT Bombay, built to obliterate friction in India's construction industry." />
      </Helmet>
      {/* Immersive Blueprint Hero */}
      <section className="relative overflow-hidden bg-transparent pt-32 pb-24 md:pt-48 md:pb-32">
        <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Reveal width="100%" direction="up">
            <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
              <span className="font-mono text-[10px] md:text-xs text-secondary uppercase tracking-[0.5em] mb-6 block border border-secondary/30 px-4 py-1.5 rounded-full bg-secondary/10 backdrop-blur-sm">
                Initialization_Protocol
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-foreground mb-8 tracking-tighter leading-[1.1]">
                Architecting the <br />
                <span className="font-serif italic text-secondary mix-blend-screen relative inline-block">
                  Future
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute -bottom-2 left-0 w-full h-[2px] bg-secondary/50 origin-left"
                  />
                </span> 
                {" "}of Construction.
              </h1>
              <p className="text-muted-foreground max-w-3xl mx-auto text-lg md:text-2xl font-medium leading-relaxed mt-6">
                BuildBazaarX operates as the unified operating system for modern home building — merging algorithmic design, verified execution logistics, and premium material supply chains into a singular, transparent platform.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Industrial Divider */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      {/* Mission & Vision Bento Box */}
      <section className="py-24 bg-transparent">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-secondary mb-4 block">Core_Directives</span>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">System Algorithms</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-12 gap-6 max-w-6xl mx-auto">
            {/* Vision Cell */}
            <Reveal width="100%" direction="up" delay={0.1} className="md:col-span-8">
              <motion.div
                whileHover={{ y: -5 }}
                className="h-full glass-panel p-12 md:p-16 rounded-[2rem] border border-white/20 shadow-xl group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-bl-[100%] translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="p-4 bg-white/10 dark:bg-white/5 w-fit rounded-2xl mb-8 backdrop-blur-sm border border-white/20">
                    <Target className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif text-foreground mb-6 italic">Our Vision</h3>
                  <p className="text-muted-foreground text-xl leading-relaxed font-medium mt-auto max-w-xl">
                    To engineer the gold standard in construction technology across South Asia. We are mobilizing an ecosystem where millions of skilled workers are empowered, and highly complex "dream homes" are distilled into accessible, rapid realities.
                  </p>
                </div>
              </motion.div>
            </Reveal>

            {/* Mission Cell */}
            <Reveal width="100%" direction="up" delay={0.2} className="md:col-span-4">
              <motion.div
                whileHover={{ y: -5 }}
                className="h-full glass-card p-10 rounded-[2rem] border border-white/20 shadow-xl group relative overflow-hidden flex flex-col justify-between"
              >
                <div className="relative z-10">
                  <div className="p-4 bg-white/10 dark:bg-white/5 w-fit rounded-2xl mb-8 border border-white/20">
                    <Rocket className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-4">The Mission</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                    To obliterate the friction in traditional construction by deploying a strict, verified network of labor, enterprise-grade suppliers, and state-of-the-art programmatic designs.
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground/60 tracking-widest">Protocol Active</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The Edge / Offerings (4-Card Grid) */}
      <section className="py-24 bg-transparent relative">
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-secondary mb-4 block">The_Edge</span>
              <h2 className="text-4xl md:text-5xl font-black text-foreground leading-[1.1] mb-6 tracking-tighter">
                Comprehensive Infrastructure
              </h2>
            </div>
          </Reveal>

          <Reveal width="100%" staggerChildren={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
              {offerings.map((offering, idx) => (
                <RevealItem key={idx}>
                  <Card className="h-full flex flex-col group overflow-hidden border-white/20 hover:border-secondary/50 transition-all duration-500 hover:shadow-[var(--glass-shadow-lg)] rounded-[2.5rem] bg-transparent glass-card">
                    <CardContent className="p-8 flex-grow flex flex-col">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-sm group-hover:scale-110 group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-500 shrink-0">
                        <offering.icon className="w-8 h-8 text-secondary group-hover:text-inherit transition-colors" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight">{offering.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed mt-auto font-medium">{offering.description}</p>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Architectural Timeline */}
      <section className="py-24 bg-transparent">
         <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-24 max-w-3xl mx-auto">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4 block">Historical_Data</span>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground italic">Expansion Milestones</h2>
            </div>
          </Reveal>

          <div className="max-w-4xl mx-auto relative">
            {/* The Central Beam */}
            <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[2px] bg-white/20 md:-translate-x-1/2" />
            
            <div className="space-y-16">
              {milestones.map((milestone, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <Reveal width="100%" direction="up" delay={idx * 0.1} key={idx}>
                    <div className={`relative flex items-center ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}>
                      {/* Node point */}
                      <div className="absolute left-[13px] md:left-1/2 w-4 h-4 bg-secondary rounded-full ring-4 ring-transparent md:-translate-x-1/2 z-10" />
                      
                      {/* Content Card */}
                      <div className={`pl-16 md:pl-0 md:w-1/2 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
                        <div className="glass-card p-8 rounded-3xl border border-white/20 shadow-lg group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                          <span className="font-mono text-4xl font-black text-foreground/10 absolute top-4 right-6 pointer-events-none group-hover:text-secondary/20 transition-colors">{milestone.year}</span>
                          <h3 className="text-2xl font-black text-foreground mb-2">{milestone.title}</h3>
                          <p className="text-muted-foreground font-medium">{milestone.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
         </div>
      </section>

      {/* Gold / Beige High Contrast CTA */}
      <section className="py-32 bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-20 text-center shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 flex items-center justify-center rounded-bl-[6rem] border-l border-b border-white/10">
              <Building className="w-24 h-24 text-white/5 -rotate-12" />
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-secondary mb-6 block font-bold">
                Execute_Final_Command
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-foreground mb-8 tracking-tighter leading-tight">
                Ready to Extract Value from Your Property?
              </h2>
              <p className="text-muted-foreground text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Onboard into the BuildBazaarX ecosystem today and initiate a seamless, data-driven construction pipeline.
              </p>
              <Button size="lg" asChild className="h-16 rounded-full px-12 text-lg font-black shadow-2xl bg-foreground text-background hover:bg-secondary hover:text-secondary-foreground border-none group overflow-hidden transition-all duration-300">
                <Link to="/contact" className="flex items-center gap-2">
                  <span className="relative z-10 flex items-center">
                    Launch Your Pipeline
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:-rotate-45 transition-transform animate-bounce" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
