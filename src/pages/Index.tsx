import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return;
        }

        const userId = session.user.id;

        // Run checks in parallel for performance
        const [profileRes, designerRes, professionalRes, supplierRes] = await Promise.all([
          supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
          supabase.from('designers').select('id').eq('id', userId).maybeSingle(),
          supabase.from('professionals').select('id').eq('id', userId).maybeSingle(),
          supabase.from('suppliers').select('id').eq('id', userId).maybeSingle()
        ]);

        if (profileRes.error) throw profileRes.error;

        if (profileRes.data?.role === 'designer' || designerRes.data) {
          navigate('/designer/dashboard');
          return;
        }
        if (profileRes.data?.role === 'professional' || professionalRes.data) {
          navigate('/professional/dashboard');
          return;
        }
        if (profileRes.data?.role === 'supplier' || supplierRes.data) {
          navigate('/supplier/dashboard');
          return;
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    checkUserRoleAndRedirect();
  }, [navigate]);

  return (
    <Layout>
      <Helmet>
        <title>BuildBazaarX – Design, Build &amp; Source Raw Materials Online</title>
        <meta name="description" content="BuildBazaarX is India's all-in-one construction marketplace. Discover premium home designs, hire verified professionals, and source quality raw materials — fast." />
        <link rel="canonical" href="https://buildbazaarx.com/" />
        <meta property="og:url" content="https://buildbazaarx.com/" />
        <meta property="og:title" content="BuildBazaarX – Design, Build & Source Raw Materials Online" />
        <meta property="og:description" content="India's all-in-one construction marketplace. Designs, professionals &amp; raw materials — one platform." />
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
