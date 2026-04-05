import { Link } from "react-router-dom";
import { ArrowRight, Play, Home, Wrench, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-interior.jpg";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Home className="w-4 h-4" />
              India's Trusted Home Solutions Platform
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Build Your{" "}
              <span className="text-primary">Dream Home</span>{" "}
              With Confidence
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              All-in-one platform for home designs, skilled workers, and quality raw materials. 
              From concept to completion, we've got you covered.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" asChild className="rounded-full text-base px-8 shadow-lg hover:shadow-xl transition-shadow">
                <Link to="/designs">
                  Explore Designs
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base px-8 border-2">
                <Play className="mr-2 w-5 h-5" />
                Watch How It Works
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Verified Workers
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="w-5 h-5 text-accent" />
                Quality Materials
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Modern home interior"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            
            {/* Stats Cards */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-lg p-4 border border-border">
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Design Templates</p>
            </div>
            <div className="absolute -top-4 -right-4 bg-card rounded-xl shadow-lg p-4 border border-border">
              <p className="text-3xl font-bold text-accent">200+</p>
              <p className="text-sm text-muted-foreground">Verified Workers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
