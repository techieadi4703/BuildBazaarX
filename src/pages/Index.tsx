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
          return;
        }

        const userId = session.user.id;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile) {
          if (profile.role === 'designer') {
            navigate('/designer/dashboard');
            return;
          }
          if (profile.role === 'professional') {
            navigate('/professional/dashboard');
            return;
          }
          if (profile.role === 'supplier') {
            navigate('/supplier/dashboard');
            return;
          }
        }

        const { data: designer } = await supabase
          .from('designers')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (designer) {
          navigate('/designer/dashboard');
          return;
        }

        const { data: professional } = await supabase
          .from('professionals')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (professional) {
          navigate('/professional/dashboard');
          return;
        }

        const { data: supplier } = await supabase
          .from('suppliers')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (supplier) {
          navigate('/supplier/dashboard');
          return;
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
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
