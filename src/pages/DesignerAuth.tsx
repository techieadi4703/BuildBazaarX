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
import logo from "@/assets/logo.png";

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
        // Check if designer profile exists
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
    if (registerForm.specializations.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select at least one specialization.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Call supabase.auth.signUp()
      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Insert row into designers table
        const { error: insertError } = await supabase
          .from("designers")
          .insert({
            id: data.user.id,
            full_name: registerForm.fullName,
            phone: registerForm.phone,
            email: registerForm.email, // save email in table too
            city: registerForm.city,
            years_experience: parseInt(registerForm.yearsOfExperience) || 0,
            bio: registerForm.bio || null,
            specializations: registerForm.specializations,
          });

        if (insertError) throw insertError;

        toast({
          title: "Registration successful!",
          description: "Welcome to BuildBazaarX Designers.",
        });
        
        // 3. Redirect
        navigate("/designer/dashboard");
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
        <Card className="w-full max-w-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
              <img src={logo} alt="BuildBazaarX" className="h-10 w-10 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold">Designers Portal</CardTitle>
            <CardDescription>Join our platform to showcase your designs</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
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
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-city">City</Label>
                      <Input 
                        id="reg-city" 
                        required 
                        value={registerForm.city}
                        onChange={(e) => setRegisterForm({...registerForm, city: e.target.value})}
                      />
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
                  </div>

                  <div className="space-y-2">
                    <Label>Specializations</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {SPECIALIZATIONS.map(spec => (
                        <div key={spec} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`spec-${spec}`} 
                            checked={registerForm.specializations.includes(spec)}
                            onCheckedChange={() => handleSpecializationToggle(spec)}
                          />
                          <Label htmlFor={`spec-${spec}`} className="font-normal text-sm">{spec}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-bio">Brief Bio</Label>
                    <Textarea 
                      id="reg-bio" 
                      maxLength={400} 
                      placeholder="Tell us about your design style and experience... (Max 400 chars)"
                      value={registerForm.bio}
                      onChange={(e) => setRegisterForm({...registerForm, bio: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register as Designer"}
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
