import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { FloatingBubbles } from "@/components/ui/FloatingBubbles";
import logo from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { ArrowLeft } from "lucide-react";

const BUSINESS_TYPES = [
  "Manufacturer", "Wholesaler", "Retailer", "Distributor", "Importer"
];

export default function SupplierAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const defaultTab = searchParams.get("mode") === "register" ? "register" : "login";

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState("");
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
      const isEmail = loginIdentifier.includes('@');
      const credentials = isEmail 
        ? { email: loginIdentifier, password: loginPassword }
        : { phone: loginIdentifier, password: loginPassword };

      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) throw error;

      if (data.user) {
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
      toast({ variant: "destructive", title: "Error signing in", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.businessType) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please select a Business Type." });
      return;
    }
    
    setIsLoading(true);
    try {
      const authData = registerForm.email 
        ? { email: registerForm.email, password: registerForm.password }
        : { phone: registerForm.phone, password: registerForm.password };

      const { data, error } = await supabase.auth.signUp({
        ...authData,
        options: {
          data: {
            full_name: registerForm.ownerName,
            phone: registerForm.phone,
            role: 'supplier',
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: insertError } = await supabase
          .from("suppliers")
          .insert({
            id: data.user.id,
            business_name: registerForm.businessName,
            owner_name: registerForm.ownerName,
            phone: registerForm.phone,
            email: registerForm.email || null,
            city: registerForm.city,
            gst_number: registerForm.gstNumber || null,
            business_type: registerForm.businessType
          });

        if (insertError) throw insertError;

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            full_name: registerForm.ownerName,
            phone: registerForm.phone,
            email: registerForm.email || null,
            role: "supplier",
          } as any);

        if (profileError) throw profileError;

        toast({ title: "Registration successful!", description: "Welcome to BuildBazaarX Suppliers Portal." });
        navigate("/supplier/dashboard");
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
              <h1 className="text-3xl font-bold tracking-tight mb-2">Supplier Portal</h1>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">Expand your reach and connect with thousands of buyers</p>
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
                             <Label htmlFor="login-id">Email or Mobile Number</Label>
                             <Input 
                               id="login-id" 
                               type="text" 
                               placeholder="email@business.com or 9876543210" 
                               required 
                               value={loginIdentifier}
                               onChange={(e) => setLoginIdentifier(e.target.value)}
                               className="rounded-xl h-12 bg-secondary/20 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
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
                                <Label htmlFor="reg-business-name">Business Name</Label>
                                <Input 
                                  id="reg-business-name" 
                                  required 
                                  value={registerForm.businessName}
                                  onChange={(e) => setRegisterForm({...registerForm, businessName: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent h-11"
                                />
                              </div>
                            </RevealItem>
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-owner-name">Owner Name</Label>
                                <Input 
                                  id="reg-owner-name" 
                                  required 
                                  value={registerForm.ownerName}
                                  onChange={(e) => setRegisterForm({...registerForm, ownerName: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent h-11"
                                />
                              </div>
                            </RevealItem>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-phone">Phone Number</Label>
                                <Input 
                                  id="reg-phone" 
                                  required 
                                  value={registerForm.phone}
                                  onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent h-11"
                                />
                              </div>
                            </RevealItem>
                             <RevealItem>
                               <div className="space-y-2">
                                 <Label htmlFor="reg-email">Email (Optional)</Label>
                                 <Input 
                                   id="reg-email" 
                                   type="email" 
                                   placeholder="optional@business.com"
                                   value={registerForm.email}
                                   onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                                   className="rounded-xl bg-secondary/20 border-transparent h-11"
                                 />
                               </div>
                             </RevealItem>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RevealItem>
                              <div className="space-y-2">
                                <Label htmlFor="reg-gst">GST Number (Optional)</Label>
                                <Input 
                                  id="reg-gst" 
                                  value={registerForm.gstNumber}
                                  onChange={(e) => setRegisterForm({...registerForm, gstNumber: e.target.value})}
                                  className="rounded-xl bg-secondary/20 border-transparent h-11"
                                />
                              </div>
                            </RevealItem>
                            <RevealItem>
                              <div className="space-y-2">
                                <Label>Business Type</Label>
                                <Select 
                                  value={registerForm.businessType} 
                                  onValueChange={(v) => setRegisterForm({...registerForm, businessType: v})}
                                >
                                  <SelectTrigger className="rounded-xl bg-secondary/20 border-transparent h-11">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BUSINESS_TYPES.map(type => (
                                      <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </RevealItem>
                          </div>

                          <Button type="submit" className="w-full mt-4 h-12 rounded-xl shadow-lg font-bold" disabled={isLoading}>
                            {isLoading ? "Registering..." : "Register as Supplier"}
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
