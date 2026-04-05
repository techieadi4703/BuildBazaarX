import { Link } from "react-router-dom";
import { 
  Home, 
  Users, 
  Package, 
  Hammer, 
  Calculator, 
  CheckCircle,
  Target,
  Eye,
  Award,
  ArrowRight
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-secondary-foreground mb-4">
            About BuildBazaarX
          </h1>
          <p className="text-secondary-foreground/80 max-w-3xl mx-auto text-lg">
            Building smarter homes with designs, skilled workers, and quality materials — all in one platform.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Who We Are</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              BuildBazaarX is a modern home construction and interior solutions platform that helps 
              customers design, customize, build, and renovate homes with ease. From design selection 
              to on-site execution and material supply, we provide everything under one roof.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To make home building simple, affordable, transparent, and stress-free by connecting 
                  customers with verified workers, trusted suppliers, and innovative designs.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become India's most trusted all-in-one home solutions platform, empowering 
                  homeowners, contractors, and suppliers through technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            What BuildBazaarX Provides
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {offerings.map((offering, index) => (
              <Card key={index} className="border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <offering.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{offering.title}</h3>
                  <p className="text-sm text-muted-foreground">{offering.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-foreground text-center mb-12">
            Why Choose BuildBazaarX?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {whyChoose.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              BuildBazaarX was founded to solve the common problems in home construction — lack of 
              transparency, unreliable workers, and scattered material sourcing. Our goal is to 
              simplify the entire process into one trusted digital platform that empowers homeowners 
              to build their dream homes with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Our Milestones
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-4 p-6 bg-background rounded-lg border border-border">
                <Award className="w-10 h-10 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground">{milestone.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Build Your Dream Home?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Contact BuildBazaarX for a free consultation and cost estimate.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/contact">
              Get Free Consultation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default About;
