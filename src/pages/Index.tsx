import React from "react";
import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { PopularDesignsSection } from "@/components/home/PopularDesignsSection";
import { MaterialsSection } from "@/components/home/MaterialsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Reveal } from "@/components/shared/Reveal";

const Index = () => {
  return (
    <Layout>
      <Reveal width="100%" direction="up"><HeroSection /></Reveal>
      <Reveal width="100%" direction="up"><PopularDesignsSection /></Reveal>
      <Reveal width="100%" direction="up"><MaterialsSection /></Reveal>
      <Reveal width="100%" direction="up"><HowItWorksSection /></Reveal>
      <Reveal width="100%" direction="up"><WhyChooseUsSection /></Reveal>
      <Reveal width="100%" direction="up"><TestimonialsSection /></Reveal>
      <Reveal width="100%" direction="up"><LeadCaptureForm variant="hero" /></Reveal>
    </Layout>
  );
};

export default Index;
