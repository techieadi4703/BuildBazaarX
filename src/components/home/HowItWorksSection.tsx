import { Palette, Calculator, Hammer } from "lucide-react";

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
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            From design selection to project completion in 3 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-border" />
          
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Icon Container */}
              <div className="relative inline-flex mb-6">
                <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center border-2 border-primary shadow-lg relative z-10">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm shadow-md">
                  {step.step}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
