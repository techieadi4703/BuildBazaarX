import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Home, Wrench, Palette, Package } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <div className="container mx-auto px-4 py-12 md:py-24 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {isLogin ? "Login to BuildBazaarX" : "Join BuildBazaarX"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select your role to {isLogin ? "access your dashboard" : "get started with the platform"}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card 
                key={role.id} 
                className="flex flex-col h-full border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-md cursor-pointer group"
                onClick={() => navigate(`${role.path}?mode=${isLogin ? 'login' : 'register'}`)}
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-4 mt-auto">
                  <Button className="w-full group-hover:bg-primary/90" size="lg" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`${role.path}?mode=${isLogin ? 'login' : 'register'}`);
                  }}>
                    {role.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default AuthRoleSelect;
