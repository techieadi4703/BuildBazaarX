import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import logo from "@/assets/logo.png";

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
  const { toast } = useToast();

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
        // Check if professional profile exists
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
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Call supabase.auth.signUp()
      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Insert row into professionals table
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

        toast({
          title: "Registration successful!",
          description: "Welcome to BuildBazaarX Professionals.",
        });
        
        // 3. Redirect
        navigate("/professional/dashboard");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error registering",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
              <img src={logo} alt="BuildBazaarX" className="h-10 w-10 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold">Professionals Portal</CardTitle>
            <CardDescription>Join our network of skilled professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="you@example.com" 
                      required 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
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
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input 
                        id="reg-name" 
                        required 
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone">Phone</Label>
                      <Input 
                        id="reg-phone" 
                        required 
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input 
                      id="reg-email" 
                      type="email" 
                      required 
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input 
                      id="reg-password" 
                      type="password" 
                      minLength={6} 
                      required 
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-profession">Profession</Label>
                      <Select 
                        required 
                        value={registerForm.profession}
                        onValueChange={(val) => setRegisterForm({...registerForm, profession: val})}
                      >
                        <SelectTrigger id="reg-profession">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFESSIONS.map(prof => (
                            <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-city">City</Label>
                      <Input 
                        id="reg-city" 
                        required 
                        value={registerForm.city}
                        onChange={(e) => setRegisterForm({...registerForm, city: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-experience">Years of Experience</Label>
                    <Input 
                      id="reg-experience" 
                      type="number" 
                      min="0" 
                      required 
                      value={registerForm.yearsOfExperience}
                      onChange={(e) => setRegisterForm({...registerForm, yearsOfExperience: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-bio">Brief Bio (Optional)</Label>
                    <Textarea 
                      id="reg-bio" 
                      maxLength={300} 
                      value={registerForm.bio}
                      onChange={(e) => setRegisterForm({...registerForm, bio: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register as Professional"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
