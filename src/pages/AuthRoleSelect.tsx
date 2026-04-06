import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Home, Wrench, Palette, Package } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingBubbles } from "@/components/ui/FloatingBubbles";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

export const AuthRoleSelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLogin = searchParams.get("mode") === "login";

  const roles = [
    {
      id: "customer",
      icon: Home,
      title: "I'm a Customer",
      description: "Browse designs, buy materials, find professionals for your home.",
      buttonText: isLogin ? "Login as Customer" : "Continue as Customer",
      path: "/auth",
    },
    {
      id: "professional",
      icon: Wrench,
      title: "I'm a Professional",
      description: "Electrician, plumber, carpenter? List your services and get hired.",
      buttonText: isLogin ? "Login as Professional" : "Join as Professional",
      path: "/professional/auth",
    },
    {
      id: "designer",
      icon: Palette,
      title: "I'm a Designer",
      description: "Interior designer? Upload your designs and reach thousands of homeowners.",
      buttonText: isLogin ? "Login as Designer" : "Join as Designer",
      path: "/designer/auth",
    },
    {
      id: "supplier",
      icon: Package,
      title: "I'm a Supplier",
      description: "Sell construction materials directly to customers and professionals.",
      buttonText: isLogin ? "Login as Supplier" : "Join as Supplier",
      path: "/supplier/auth",
    },
  ];

  return (
    <Layout>
      <div className="relative min-h-[90vh] overflow-hidden bg-secondary/20 flex items-center">
        {/* Floating Bubbles */}
        <FloatingBubbles count={16} palette="brand" />

        <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl relative z-10">
          <Reveal width="100%" direction="up" distance={30}>
            <div className="text-center mb-16">
              <motion.h1 
                className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {isLogin ? (
                  <>Login to <span className="text-shimmer">BuildBazaarX</span></>
                ) : (
                  <>Join <span className="text-shimmer">BuildBazaarX</span></>
                )}
              </motion.h1>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                Select your role to {isLogin ? "access your dashboard" : "get started with the platform"}.
              </p>
            </div>
          </Reveal>

          <Reveal width="100%" staggerChildren={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <RevealItem key={role.id}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card 
                        className="flex flex-col h-full border-border/50 hover:border-primary/50 transition-all duration-500 cursor-pointer group shadow-xl hover:shadow-2xl bg-background overflow-hidden relative"
                        onClick={() => navigate(`${role.path}?mode=${isLogin ? 'login' : 'register'}`)}
                      >
                        <CardHeader className="pb-6 relative z-10">
                          <motion.div 
                            className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500"
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                          >
                            <Icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-500" />
                          </motion.div>
                          <CardTitle className="text-3xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                            {role.title}
                          </CardTitle>
                          <CardDescription className="text-lg leading-relaxed">
                            {role.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-6 mt-auto relative z-10">
                          <Button 
                            className="w-full h-14 text-lg font-bold rounded-2xl group-hover:shadow-2xl transition-all duration-500 relative overflow-hidden" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`${role.path}?mode=${isLogin ? 'login' : 'register'}`);
                            }}
                          >
                            <span className="relative z-10">{role.buttonText}</span>
                            <motion.div 
                              className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                          </Button>
                        </CardFooter>
                        
                        {/* Subtle background glow on hover */}
                        <motion.div 
                          className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
                        />
                      </Card>
                    </motion.div>
                  </RevealItem>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </Layout>
  );
};

export default AuthRoleSelect;
