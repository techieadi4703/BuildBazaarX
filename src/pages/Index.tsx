import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  const navigate = useNavigate();
  const { userRole, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    if (userRole === 'designer') {
      navigate('/designer/dashboard');
    } else if (userRole === 'professional') {
      navigate('/professional/dashboard');
    } else if (userRole === 'supplier') {
      navigate('/supplier/dashboard');
    }
  }, [userRole, isAuthenticated, isLoading, navigate]);

  // Optionally show a loading state while deciding on the redirect.
  // This prevents the page from flashing before redirection to dashboard.
  if (isLoading || (isAuthenticated && userRole && userRole !== 'customer')) {
     return <div className="min-h-screen bg-background" />;
  }

  return (
    <Layout>
      <Helmet>
        <title>BuildBazaarX – Design, Build &amp; Source Raw Materials Online</title>
        <meta name="description" content="BuildBazaarX is India's all-in-one construction marketplace. Discover premium home designs, hire verified professionals, and source quality raw materials — fast." />
        <link rel="canonical" href="https://buildbazaarx.com/" />
        <meta property="og:url" content="https://buildbazaarx.com/" />
        <meta property="og:title" content="BuildBazaarX – Design, Build & Source Raw Materials Online" />
        <meta property="og:description" content="India's all-in-one construction marketplace. Designs, professionals &amp; raw materials — one platform." />
        <meta property="og:image" content="https://buildbazaarx.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Helmet>
      <Reveal width="100%" direction="up"><HeroSection /></Reveal>
      <Reveal width="100%" direction="up"><HowItWorksSection /></Reveal>
      <Reveal width="100%" direction="up"><PopularDesignsSection /></Reveal>
      <Reveal width="100%" direction="up"><MaterialsSection /></Reveal>
      <Reveal width="100%" direction="up"><TestimonialsSection /></Reveal>
      <Reveal width="100%" direction="up"><WhyChooseUsSection /></Reveal>
      <Reveal width="100%" direction="up"><LeadCaptureForm variant="hero" /></Reveal>
    </Layout>
  );
};

export default Index;
