import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { PopularDesignsSection } from "@/components/home/PopularDesignsSection";
import { MaterialsSection } from "@/components/home/MaterialsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PopularDesignsSection />
      <MaterialsSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <LeadCaptureForm variant="hero" />
    </Layout>
  );
};

export default Index;
