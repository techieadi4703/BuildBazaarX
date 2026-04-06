import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { FloatingBubbles } from "@/components/ui/FloatingBubbles";
import logo from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const mode = searchParams.get("mode");
  const defaultTab = mode === "register" ? "signup" : "login";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(loginData.email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (loginData.password.length < 6) {
      toast({ title: "Invalid Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome back!", description: "You have successfully logged in." });
        navigate("/");
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.name.trim()) {
      toast({ title: "Name Required", description: "Please enter your name.", variant: "destructive" });
      return;
    }
    if (!validateEmail(signupData.email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (signupData.password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: { full_name: signupData.name }
        }
      });
      if (error) {
        toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account Created!", description: "Please check your email to verify your account." });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[90vh] bg-secondary/30 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <FloatingBubbles count={14} palette="brand" />
        
        <Reveal width="100%" direction="up" distance={40}>
          <div className="w-full max-w-lg relative z-10 mx-auto">
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

            {/* Logo & Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              >
                <img src={logo} alt="BuildBazaarX" className="h-20 mx-auto mb-6 bg-background rounded-2xl p-2 shadow-xl" />
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Customer Portal</h1>
              <p className="text-muted-foreground text-lg">Your one-stop shop for home interiors</p>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-background/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-2 pt-8">
                  <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                  <CardDescription>Enter your details to continue</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1 rounded-2xl h-12">
                      <TabsTrigger value="login" className="rounded-xl data-[state=active]:shadow-lg">Login</TabsTrigger>
                      <TabsTrigger value="signup" className="rounded-xl data-[state=active]:shadow-lg">Sign Up</TabsTrigger>
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
                            <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-12 h-12 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="login-password">Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-12 pr-12 h-12 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <Button type="submit" className="w-full h-12 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                          </Button>
                        </motion.form>
                      </TabsContent>

                      <TabsContent value="signup" key="signup">
                        <motion.form 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onSubmit={handleSignup} 
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="signup-name">Full Name</Label>
                            <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-name"
                                type="text"
                                placeholder="Your name"
                                className="pl-12 h-12 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                                value={signupData.name}
                                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-12 h-12 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                                value={signupData.email}
                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-12 pr-12 h-12 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                                value={signupData.password}
                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-confirm">Confirm Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="signup-confirm"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-12 h-12 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                                value={signupData.confirmPassword}
                                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <Button type="submit" className="w-full h-12 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold mt-2" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Create Account"}
                          </Button>
                        </motion.form>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm text-muted-foreground mt-8 leading-relaxed"
            >
              By continuing, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
            </motion.p>
          </div>
        </Reveal>
      </div>
    </Layout>
  );
};

export default Auth;
