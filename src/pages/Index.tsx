import React, { useEffect, useState } from "react";
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
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsCheckingRole(false);
          return;
        }

        const userId = session.user.id;

        // Check if user is a Designer
        const { data: designer } = await supabase
          .from('designers')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (designer) {
          navigate('/designer/dashboard');
          return;
        }

        // Check if user is a Professional
        const { data: professional } = await supabase
          .from('professionals')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (professional) {
          navigate('/professional/dashboard');
          return;
        }

        // Check if user is a Supplier
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (supplier) {
          navigate('/supplier/dashboard');
          return;
        }

        // If no specific role is found, just show the home page
        setIsCheckingRole(false);
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsCheckingRole(false);
      }
    };

    checkUserRoleAndRedirect();
  }, [navigate]);

  if (isCheckingRole) {
    return (
      <Layout>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg text-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
