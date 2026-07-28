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
import { PageHeader } from "@/components/shared/PageHeader";
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
      <PageHeader
        title="Building the future of construction."
        crumb="About"
        subtitle="BuildBazaarX brings smart design, verified professionals, and quality materials into one easy platform."
      />

      {/* Mission & Vision */}
      <section className="py-16 md:py-20 bg-[var(--bg-base)]">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-10 max-w-3xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-3">Our Goals</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">What We Do</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-12 gap-6 max-w-6xl mx-auto">
            {/* Vision Cell */}
            <Reveal width="100%" direction="up" delay={0.1} className="md:col-span-8">
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full bg-[var(--bg-surface)] p-10 md:p-14 rounded-2xl border border-[var(--border-subtle)]/60 transition-shadow duration-300 hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex flex-col h-full">
                  <div className="p-3.5 bg-[var(--accent-warm-faint)] w-fit rounded-xl mb-7">
                    <Target className="w-6 h-6 text-[var(--accent-warm)]" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl text-[var(--text-primary)] mb-4 font-semibold">Our Vision</h3>
                  <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed mt-auto max-w-xl">
                    To set the standard in construction technology across South Asia — a community where skilled workers are empowered, and building your dream home becomes easy and fast.
                  </p>
                </div>
              </motion.div>
            </Reveal>

            {/* Mission Cell */}
            <Reveal width="100%" direction="up" delay={0.2} className="md:col-span-4">
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full bg-[var(--bg-card)] p-8 md:p-10 rounded-2xl border border-[var(--border-subtle)]/60 transition-shadow duration-300 hover:shadow-[var(--shadow-md)] flex flex-col justify-between"
              >
                <div>
                  <div className="p-3.5 bg-[var(--accent)]/10 w-fit rounded-xl mb-7">
                    <Rocket className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl text-[var(--text-primary)] mb-4 font-semibold">The Mission</h3>
                  <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                    Removing the hassle from traditional construction with a trusted network of labor, quality suppliers, and modern home designs.
                  </p>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-16 md:py-20 bg-[var(--bg-surface)]">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-10 max-w-3xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-3">Why Us</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">
                Everything You Need
              </h2>
            </div>
          </Reveal>

          <Reveal width="100%" staggerChildren={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto items-stretch">
              {offerings.map((offering, idx) => (
                <RevealItem key={idx}>
                  <Card className="h-full flex flex-col group overflow-hidden border-[var(--border-subtle)]/60 hover:border-[var(--accent-warm)]/50 transition-all duration-300 hover:shadow-[var(--shadow-md)] rounded-2xl bg-[var(--bg-base)]">
                    <CardContent className="p-7 flex-grow flex flex-col">
                      <div className="w-12 h-12 bg-[var(--bg-card)] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--accent-warm)] transition-colors duration-300 shrink-0">
                        <offering.icon className="w-5 h-5 text-[var(--accent-warm)] group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2.5 leading-tight">{offering.title}</h3>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-auto">{offering.description}</p>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-20 bg-[var(--bg-base)]">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-warm)] mb-3">Our Journey</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">Milestones</h2>
            </div>
          </Reveal>

          <div className="max-w-3xl mx-auto relative">
            {/* Central line */}
            <div className="absolute left-[7px] md:left-1/2 top-0 bottom-0 w-px bg-[var(--border-subtle)] md:-translate-x-1/2" />

            <div className="space-y-8">
              {milestones.map((milestone, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <Reveal width="100%" direction="up" delay={idx * 0.1} key={idx}>
                    <div className={`relative flex items-center ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}>
                      {/* Node point */}
                      <div className="absolute left-0 md:left-1/2 w-3.5 h-3.5 bg-[var(--accent-warm)] rounded-full ring-4 ring-[var(--bg-base)] md:-translate-x-1/2 z-10" />

                      {/* Content */}
                      <div className={`pl-10 md:pl-0 md:w-1/2 ${isEven ? "md:pr-14 md:text-right" : "md:pl-14 md:text-left"}`}>
                        <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)]/60 hover:shadow-[var(--shadow-sm)] transition-shadow duration-300">
                          <p className="text-xs font-mono text-[var(--accent-warm)] mb-2 tracking-widest">{milestone.year}</p>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1.5">{milestone.title}</h3>
                          <p className="text-[var(--text-secondary)] text-sm">{milestone.subtitle}</p>
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

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-[var(--bg-surface)]">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up">
            <div className="max-w-3xl mx-auto text-center">
              <Building className="w-8 h-8 text-[var(--accent-warm)] mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-tight mb-4">
                Ready to build your dream home?
              </h2>
              <p className="text-[var(--text-secondary)] text-base md:text-lg mb-10 max-w-xl mx-auto">
                Join BuildBazaarX today and start a smooth, easy construction journey.
              </p>
              <Button size="lg" asChild className="h-12 rounded-full px-8 text-sm font-semibold bg-[var(--accent-warm)] text-white hover:opacity-90 transition-opacity">
                <Link to="/contact" className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default About;
