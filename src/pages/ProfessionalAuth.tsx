import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { FloatingBubbles } from "@/components/ui/FloatingBubbles";
import logo from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { ArrowLeft } from "lucide-react";

const PROFESSIONS = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Mason",
  "HVAC Technician",
  "Interior Fitter",
  "Welder",
  "False Ceiling Expert",
  "Tile Layer",
  "Glass & Aluminium Worker"
];

export default function ProfessionalAuth() {
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
    profession: "",
    city: "",
    yearsOfExperience: "",
    bio: ""
  });

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
        const { data: profData, error: profError } = await supabase
          .from("professionals")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profError) throw profError;

        if (!profData) {
          navigate("/professional/setup");
        } else {
          navigate("/professional/dashboard");
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
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: insertError } = await supabase
          .from("professionals")
          .insert({
            id: data.user.id,
            full_name: registerForm.fullName,
            phone: registerForm.phone,
            profession: registerForm.profession,
            city: registerForm.city,
            years_experience: parseInt(registerForm.yearsOfExperience) || 0,
            bio: registerForm.bio || null,
          });

        if (insertError) throw insertError;

        toast({ title: "Registration successful!", description: "Welcome to BuildBazaarX Professionals." });
        navigate("/professional/dashboard");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error registering", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[90vh] flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden bg-secondary/20">
        <FloatingBubbles count={14} palette="brand" />
        
        <Reveal width="100%" direction="up" distance={40}>
          <div className="w-full max-w-xl relative z-10 mx-auto">
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
              <h1 className="text-3xl font-bold tracking-tight mb-2">Professionals Portal</h1>
              <p className="text-muted-foreground text-lg">Join our network of skilled professionals</p>
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
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-name">Full Name</Label>
                                <Input 
                                  id="reg-name" 
                                  required 
                                  value={registerForm.fullName}
                                  onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent"
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
                                  className="rounded-xl bg-secondary/20 border-transparent"
                                />
                              </div>
                            </RevealItem>
                          </div>

                          <RevealItem>
                            <div className="space-y-2">
                              <Label htmlFor="reg-email">Email</Label>
                              <Input 
                                id="reg-email" 
                                type="email" 
                                required 
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                                className="rounded-xl bg-secondary/20 border-transparent"
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
                                className="rounded-xl bg-secondary/20 border-transparent"
                              />
                            </div>
                          </RevealItem>

                          <div className="grid grid-cols-2 gap-4">
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-profession">Profession</Label>
                                <Select 
                                  required 
                                  value={registerForm.profession}
                                  onValueChange={(val) => setRegisterForm({...registerForm, profession: val})}
                                >
                                  <SelectTrigger id="reg-profession" className="rounded-xl bg-secondary/20 border-transparent">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PROFESSIONS.map(prof => (
                                      <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </RevealItem>
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-city">City</Label>
                                <Input 
                                  id="reg-city" 
                                  required 
                                  value={registerForm.city}
                                  onChange={(e) => setRegisterForm({...registerForm, city: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent"
                                />
                              </div>
                            </RevealItem>
                          </div>

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
                                className="rounded-xl bg-secondary/20 border-transparent"
                              />
                            </div>
                          </RevealItem>

                          <RevealItem>
                            <div className="space-y-2">
                              <Label htmlFor="reg-bio">Brief Bio (Optional)</Label>
                              <Textarea 
                                id="reg-bio" 
                                maxLength={300} 
                                value={registerForm.bio}
                                onChange={(e) => setRegisterForm({...registerForm, bio: e.target.value})}
                                className="rounded-xl bg-secondary/20 border-transparent min-h-[100px]"
                              />
                            </div>
                          </RevealItem>

                          <Button type="submit" className="w-full mt-4 h-12 rounded-xl shadow-lg font-bold" disabled={isLoading}>
                            {isLoading ? "Registering..." : "Register as Professional"}
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
