import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Layout } from "@/components/layout/Layout";
import { FloatingBubbles } from "@/components/ui/FloatingBubbles";
import logo from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { ArrowLeft } from "lucide-react";

const SPECIALIZATIONS = [
  "Modular Kitchen", "Bedroom", "Living Room", "Bathroom",
  "Full Home", "Office Interior", "Kids Room", "Pooja Room", "Wardrobe"
];

export default function DesignerAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const defaultTab = searchParams.get("mode") === "register" ? "register" : "login";

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    city: "",
    yearsOfExperience: "",
    bio: "",
    specializations: [] as string[]
  });

  const handleSpecializationToggle = (spec: string) => {
    setRegisterForm(prev => {
      const isSelected = prev.specializations.includes(spec);
      if (isSelected) {
        return { ...prev, specializations: prev.specializations.filter(s => s !== spec) };
      } else {
        return { ...prev, specializations: [...prev.specializations, spec] };
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      if (data.user) {
        const { data: designerData, error: designerError } = await supabase
          .from("designers")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (designerError) throw designerError;

        if (!designerData) {
          navigate("/designer/setup");
        } else {
          navigate("/designer/dashboard");
        }
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error signing in", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.specializations.length === 0) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please select at least one specialization." });
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: insertError } = await supabase
          .from("designers")
          .insert({
            id: data.user.id,
            full_name: registerForm.fullName,
            phone: registerForm.phone,
            email: registerForm.email,
            city: registerForm.city,
            years_experience: parseInt(registerForm.yearsOfExperience) || 0,
            bio: registerForm.bio || null,
            specializations: registerForm.specializations,
          });

        if (insertError) throw insertError;

        toast({ title: "Registration successful!", description: "Welcome to BuildBazaarX Designers." });
        navigate("/designer/dashboard");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error registering", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[90vh] flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden bg-gradient-to-br from-secondary/40 via-background to-primary/5">
        <FloatingBubbles count={14} palette="brand" />
        
        <Reveal width="100%" direction="up" distance={40}>
          <div className="w-full max-w-2xl relative z-10 mx-auto">
            {/* Back Button */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/auth/select-role")}
                className="hover:bg-background/50 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Role Selection
              </Button>
            </motion.div>

            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              >
                <img src={logo} alt="BuildBazaarX" className="h-20 mx-auto mb-6 bg-background rounded-2xl p-2 shadow-xl" />
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Designers Portal</h1>
              <p className="text-muted-foreground text-lg">Join our platform to showcase your designs</p>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-background/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1 rounded-2xl h-12">
                      <TabsTrigger value="login" className="rounded-xl data-[state=active]:shadow-lg">Login</TabsTrigger>
                      <TabsTrigger value="register" className="rounded-xl data-[state=active]:shadow-lg">Register</TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      <TabsContent value="login" key="login">
                        <motion.form 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          onSubmit={handleLogin} 
                          className="space-y-6"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="login-email">Email</Label>
                            <Input 
                              id="login-email" 
                              type="email" 
                              placeholder="you@example.com" 
                              required 
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              className="rounded-xl h-12 bg-secondary/20 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="login-password">Password</Label>
                            <Input 
                              id="login-password" 
                              type="password" 
                              required 
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="rounded-xl h-12 bg-secondary/20 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                          </div>
                          <Button type="submit" className="w-full h-12 rounded-xl shadow-lg font-bold" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                          </Button>
                        </motion.form>
                      </TabsContent>

                      <TabsContent value="register" key="register">
                        <motion.form 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onSubmit={handleRegister} 
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-name">Full Name</Label>
                                <Input 
                                  id="reg-name" 
                                  required 
                                  value={registerForm.fullName}
                                  onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent h-11"
                                />
                              </div>
                            </RevealItem>
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-phone">Phone</Label>
                                <Input 
                                  id="reg-phone" 
                                  required 
                                  value={registerForm.phone}
                                  onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent h-11"
                                />
                              </div>
                            </RevealItem>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-email">Email</Label>
                                <Input 
                                  id="reg-email" 
                                  type="email" 
                                  required 
                                  value={registerForm.email}
                                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent h-11"
                                />
                              </div>
                            </RevealItem>
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-password">Password</Label>
                                <Input 
                                  id="reg-password" 
                                  type="password" 
                                  minLength={6} 
                                  required 
                                  value={registerForm.password}
                                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent h-11"
                                />
                              </div>
                            </RevealItem>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-city">City</Label>
                                <Input 
                                  id="reg-city" 
                                  required 
                                  value={registerForm.city}
                                  onChange={(e) => setRegisterForm({...registerForm, city: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent h-11"
                                />
                              </div>
                            </RevealItem>
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-experience">Years of Experience</Label>
                                <Input 
                                  id="reg-experience" 
                                  type="number" 
                                  min="0" 
                                  required 
                                  value={registerForm.yearsOfExperience}
                                  onChange={(e) => setRegisterForm({...registerForm, yearsOfExperience: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent h-11"
                                />
                              </div>
                            </RevealItem>
                          </div>

                          <RevealItem>
                            <div className="space-y-4 bg-secondary/20 p-6 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                              <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Specializations</Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                {SPECIALIZATIONS.map(spec => (
                                  <div key={spec} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleSpecializationToggle(spec)}>
                                    <Checkbox 
                                      id={`spec-${spec}`} 
                                      checked={registerForm.specializations.includes(spec)}
                                      onCheckedChange={() => handleSpecializationToggle(spec)}
                                      className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <Label htmlFor={`spec-${spec}`} className="font-medium text-sm cursor-pointer group-hover:text-primary transition-colors">{spec}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </RevealItem>

                          <RevealItem>
                            <div className="space-y-2">
                              <Label htmlFor="reg-bio">Brief Bio</Label>
                              <Textarea 
                                id="reg-bio" 
                                maxLength={400} 
                                placeholder="Tell us about your design style and experience... (Max 400 chars)"
                                value={registerForm.bio}
                                onChange={(e) => setRegisterForm({...registerForm, bio: e.target.value})}
                                className="rounded-xl bg-secondary/20 border-transparent min-h-[120px]"
                              />
                            </div>
                          </RevealItem>

                          <Button type="submit" className="w-full mt-4 h-12 rounded-xl shadow-lg font-bold" disabled={isLoading}>
                            {isLoading ? "Registering..." : "Register as Designer"}
                          </Button>
                        </motion.form>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
}
