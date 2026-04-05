import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import logo from "@/assets/logo.png";

const BUSINESS_TYPES = [
  "Manufacturer", "Wholesaler", "Retailer", "Distributor", "Importer"
];

export default function SupplierAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerForm, setRegisterForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    city: "",
    gstNumber: "",
    businessType: ""
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
        // Check if supplier profile exists
        const { data: supplierData, error: supplierError } = await supabase
          .from("suppliers")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (supplierError) throw supplierError;

        if (!supplierData) {
          navigate("/supplier/setup");
        } else {
          navigate("/supplier/dashboard");
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
    if (!registerForm.businessType) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a Business Type.",
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
        // 2. Insert row into suppliers table
        const { error: insertError } = await supabase
          .from("suppliers")
          .insert({
            id: data.user.id,
            business_name: registerForm.businessName,
            owner_name: registerForm.ownerName,
            phone: registerForm.phone,
            email: registerForm.email,
            city: registerForm.city,
            gst_number: registerForm.gstNumber || null,
            business_type: registerForm.businessType
          });

        if (insertError) throw insertError;

        toast({
          title: "Registration successful!",
          description: "Welcome to BuildBazaarX Suppliers Portal.",
        });
        
        // 3. Redirect
        navigate("/supplier/dashboard");
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
            <CardTitle className="text-2xl font-bold">Supplier Portal</CardTitle>
            <CardDescription>Join our platform to radically expand your wholesale and retail reach</CardDescription>
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
                      placeholder="you@business.com" 
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
                      <Label htmlFor="reg-business-name">Business Name</Label>
                      <Input 
                        id="reg-business-name" 
                        required 
                        value={registerForm.businessName}
                        onChange={(e) => setRegisterForm({...registerForm, businessName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-owner-name">Owner Name</Label>
                      <Input 
                        id="reg-owner-name" 
                        required 
                        value={registerForm.ownerName}
                        onChange={(e) => setRegisterForm({...registerForm, ownerName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone">Phone Number</Label>
                      <Input 
                        id="reg-phone" 
                        required 
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                      />
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-gst">GST Number (Optional)</Label>
                      <Input 
                        id="reg-gst" 
                        value={registerForm.gstNumber}
                        onChange={(e) => setRegisterForm({...registerForm, gstNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Type</Label>
                      <Select 
                        value={registerForm.businessType} 
                        onValueChange={(v) => setRegisterForm({...registerForm, businessType: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register as Supplier"}
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
