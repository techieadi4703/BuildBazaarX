import { 
  Home, 
  DollarSign, 
  UserCheck, 
  Award, 
  Zap, 
  Shield 
} from "lucide-react";

const features = [
  {
    icon: Home,
    title: "All-in-One Platform",
    description: "Designs, workers, and materials — everything under one roof.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Clear cost breakdowns with no hidden charges.",
  },
  {
    icon: UserCheck,
    title: "Verified Workers",
    description: "Background-checked skilled professionals for quality execution.",
  },
  {
    icon: Award,
    title: "Quality Material Partners",
    description: "Genuine products from trusted brands like Greenply, Asian Paints.",
  },
  {
    icon: Zap,
    title: "Fast Project Execution",
    description: "Streamlined process for timely project completion.",
  },
  {
    icon: Shield,
    title: "End-to-End Support",
    description: "Dedicated support from design selection to handover.",
  },
];

export const WhyChooseUsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Our Advantage
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mt-2 mb-4">
            Why Choose BuildBazaarX?
          </h2>
          <p className="text-secondary-foreground/80">
            We bring together everything you need to build or renovate your home with confidence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
