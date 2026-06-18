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
      <section className="relative overflow-hidden bg-[var(--bg-base)] pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <Reveal width="100%" direction="up">
            <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
              <span className="font-mono text-[10px] md:text-xs text-[var(--accent-warm)] uppercase tracking-[0.5em] mb-6 block border border-[var(--accent-warm)]/30 px-4 py-1.5 rounded-full bg-[var(--accent-warm)]/10 backdrop-blur-sm">
                Our Story
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)] mb-8 tracking-tighter leading-[1.1]">
                Building the <br />
                <span className="font-serif italic text-[var(--accent-warm)] mix-blend-screen relative inline-block">
                  Future
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute -bottom-2 left-0 w-full h-[2px] bg-[var(--accent-warm)]/50 origin-left"
                  />
                </span>
                {" "}of Construction.
              </h1>
              <p className="text-[var(--text-secondary)] max-w-3xl mx-auto text-lg md:text-2xl font-medium leading-relaxed mt-6">
                BuildBazaarX is your all-in-one platform for modern home building, bringing together smart design, reliable professionals, and <br /> high-quality materials into one easy-to-use platform.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Industrial Divider */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#C5A572]/20 to-transparent" />

      {/* Mission & Vision Bento Box */}
      <section className="py-12 bg-[var(--bg-surface)]">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-8 max-w-3xl mx-auto">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent-warm)] mb-4 block">Our Goals</span>
              <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">What We Do</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-12 gap-6 max-w-6xl mx-auto">
            {/* Vision Cell */}
            <Reveal width="100%" direction="up" delay={0.1} className="md:col-span-8">
              <motion.div
                whileHover={{ y: -5 }}
                className="h-full bg-[var(--bg-base)] p-12 md:p-16 rounded-[2rem] border border-[var(--border-subtle)]/10 shadow-xl group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--bg-card)]/5 rounded-bl-[100%] translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="p-4 bg-[var(--accent-warm)]/10 w-fit rounded-2xl mb-8 backdrop-blur-sm border border-[var(--accent-warm)]/20">
                    <Target className="w-8 h-8 text-[var(--accent-warm)]" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif text-[var(--text-primary)] mb-6 italic">Our Vision</h3>
                  <p className="text-[var(--text-secondary)] text-xl leading-relaxed font-medium mt-auto max-w-xl">
                    To set the standard in construction technology across South Asia. We are building a community where millions of skilled workers are empowered, and building your dream home becomes an easy, quick reality.
                  </p>
                </div>
              </motion.div>
            </Reveal>

            {/* Mission Cell */}
            <Reveal width="100%" direction="up" delay={0.2} className="md:col-span-4">
              <motion.div
                whileHover={{ y: -5 }}
                className="h-full bg-[var(--bg-card)] p-10 rounded-[2rem] border border-[var(--border-subtle)]/5 shadow-xl group relative overflow-hidden flex flex-col justify-between"
              >
                <div className="relative z-10">
                  <div className="p-4 bg-[var(--accent)]/10 w-fit rounded-2xl mb-8">
                    <Rocket className="w-8 h-8 text-[var(--accent)]" />
                  </div>
                  <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4">The Mission</h3>
                  <p className="text-[var(--text-secondary)] text-lg leading-relaxed font-medium">
                    To remove the hassle from traditional construction by providing a trusted network of labor, top-quality suppliers, and modern home designs.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]/10 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest">Status Active</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The Edge / Offerings (4-Card Grid) */}
      <section className="py-12 bg-[var(--bg-card)] relative">
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-8 max-w-3xl mx-auto">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent-warm)] mb-4 block">Why Us</span>
              <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] leading-[1.1] mb-6 tracking-tighter">
                Everything You Need
              </h2>
            </div>
          </Reveal>

          <Reveal width="100%" staggerChildren={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
              {offerings.map((offering, idx) => (
                <RevealItem key={idx}>
                  <Card className="h-full flex flex-col group overflow-hidden border-[var(--border-subtle)]/5 hover:border-[var(--accent-warm)]/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-[2.5rem] bg-[var(--bg-surface)]">
                    <CardContent className="p-8 flex-grow flex flex-col">
                      <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mb-8 border border-[var(--border-subtle)]/5 shadow-sm group-hover:scale-110 group-hover:bg-[var(--accent-warm)] transition-all duration-500 shrink-0">
                        <offering.icon className="w-8 h-8 text-[var(--accent-warm)] group-hover:text-[var(--text-primary)] transition-colors" />
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4 leading-tight">{offering.title}</h3>
                      <p className="text-[var(--text-secondary)] text-lg leading-relaxed mt-auto font-medium">{offering.description}</p>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Architectural Timeline */}
      <section className="py-12 bg-[var(--bg-surface)]">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-10 max-w-3xl mx-auto">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-tertiary)] mb-4 block">Our Journey</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[var(--text-primary)] italic">Milestones</h2>
            </div>
          </Reveal>

          <div className="max-w-4xl mx-auto relative">
            {/* The Central Beam */}
            <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[2px] bg-[var(--accent)]/10 md:-translate-x-1/2" />

            <div className="space-y-10">
              {milestones.map((milestone, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <Reveal width="100%" direction="up" delay={idx * 0.1} key={idx}>
                    <div className={`relative flex items-center ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}>
                      {/* Node point */}
                      <div className="absolute left-[13px] md:left-1/2 w-4 h-4 bg-[var(--accent-warm)] rounded-full ring-4 ring-[#F4F0EA] md:-translate-x-1/2 z-10" />

                      {/* Content Card */}
                      <div className={`pl-16 md:pl-0 md:w-1/2 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
                        <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-subtle)]/5 shadow-[var(--shadow-md)] group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                          <span className="font-mono text-4xl font-black text-[var(--border-default)] absolute top-4 right-6 pointer-events-none group-hover:text-[var(--accent-warm)]/20 transition-colors">{milestone.year}</span>
                          <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">{milestone.title}</h3>
                          <p className="text-[var(--text-secondary)] font-medium">{milestone.subtitle}</p>
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
      <section className="py-14 bg-[var(--bg-base)] relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <Reveal width="100%" direction="up">
            <div className="max-w-5xl mx-auto bg-[var(--accent-warm)] rounded-[3rem] p-8 md:p-12 text-center shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-[var(--border-subtle)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 flex items-center justify-center rounded-bl-[6rem] border-l border-b border-[var(--border-subtle)]/10">
                <Building className="w-24 h-24 text-[var(--border-default)] -rotate-12" />
              </div>

              <div className="relative z-10 max-w-3xl mx-auto">
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--text-primary)]/70 mb-6 block font-bold">
                  Get Started
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-8 tracking-tighter leading-tight">
                  Ready to Build Your Dream Home?
                </h2>
                <p className="text-[var(--text-primary)] text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                  Join BuildBazaarX today and start a smooth, easy construction journey.
                </p>
                <Button size="lg" asChild className="h-16 rounded-full px-12 text-lg font-black shadow-2xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/80 group overflow-hidden transition-all duration-300">
                  <Link to="/contact" className="flex items-center gap-2">
                    <span className="relative z-10 flex items-center">
                      Get Started Now
                      <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:-rotate-45 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-[var(--bg-card)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default About;
