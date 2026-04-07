import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, MapPin, Mail, Save, Loader2, Package, Sparkles, Badge } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState("customer");
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setCurrentRole(data.role || "customer");
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
        });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        role: currentRole || "customer",
      });

    if (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Loader2 className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-xl font-medium text-muted-foreground animate-pulse">Loading your profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header Area */}
            <div className="mb-12">
              <Reveal width="100%" direction="up">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                        <User className="w-8 h-8" />
                      </div>
                      My Profile
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">Manage your personal and shipping details</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" asChild className="h-12 rounded-2xl px-6 font-bold border-2 shadow-sm bg-background">
                      <Link to="/orders">
                        <Package className="w-5 h-5 mr-3" />
                        Order History
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </Reveal>
            </div>
            
            <Reveal width="100%" direction="up" delay={0.2}>
              <Card className="border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.05)] bg-background/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10">
                  <form onSubmit={handleUpdate} className="space-y-10">
                    {/* Section 1: Basic Info */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.25em] flex items-center gap-2 mb-8">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Account Details
                      </h3>
                      
                      <div className="grid sm:grid-cols-2 gap-8">
                        <RevealItem>
                          <div className="space-y-3">
                            <Label htmlFor="full_name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                            <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="full_name"
                                value={profile.full_name}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                placeholder="E.g. Aditya Srivastava"
                                className="pl-12 h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                              />
                            </div>
                          </div>
                        </RevealItem>
                        
                        <RevealItem>
                          <div className="space-y-3">
                            <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                            <div className="relative group">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id="phone"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                placeholder="+91 XXXXX XXXXX"
                                className="pl-12 h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                              />
                            </div>
                          </div>
                        </RevealItem>
                      </div>

                      <RevealItem>
                        <div className="space-y-3">
                          <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address (Read-only)</Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              value={user?.email || ""}
                              disabled
                              className="pl-12 h-14 rounded-2xl bg-muted/40 cursor-not-allowed border-none font-medium opacity-60"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter rounded-full border-muted-foreground/20">Verified</Badge>
                            </div>
                          </div>
                        </div>
                      </RevealItem>
                    </div>

                    {/* Section 2: Address Info */}
                    <div className="space-y-6 pt-10 border-t border-border/50">
                      <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.25em] flex items-center gap-2 mb-8">
                        <MapPin className="w-4 h-4 text-primary" />
                        Shipping Destination
                      </h3>
                      
                      <RevealItem>
                        <div className="space-y-3">
                          <Label htmlFor="address" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Street Address</Label>
                          <div className="relative group">
                            <MapPin className="absolute left-4 top-5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Textarea
                              id="address"
                              value={profile.address}
                              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                              placeholder="House No, Street Name, Area / Landmark..."
                              rows={3}
                              className="pl-12 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[120px] pt-4"
                            />
                          </div>
                        </div>
                      </RevealItem>

                      <div className="grid sm:grid-cols-2 gap-8">
                        <RevealItem>
                          <div className="space-y-3">
                            <Label htmlFor="city" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">City</Label>
                            <Input
                              id="city"
                              value={profile.city}
                              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                              placeholder="Your City"
                              className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-3">
                            <Label htmlFor="state" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">State</Label>
                            <Input
                              id="state"
                              value={profile.state}
                              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                              placeholder="State / Region"
                              className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                          </div>
                        </RevealItem>
                      </div>

                      <RevealItem>
                        <div className="space-y-3 sm:max-w-md">
                          <Label htmlFor="pincode" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Pincode</Label>
                          <Input
                            id="pincode"
                            value={profile.pincode}
                            onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                            placeholder="6-Digit Code"
                            maxLength={6}
                            className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                          />
                        </div>
                      </RevealItem>
                    </div>

                    {/* Submit Bar */}
                    <motion.div 
                      className="pt-10 flex justify-end"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="h-16 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 min-w-[200px] overflow-hidden group relative" 
                        disabled={isSaving}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          {isSaving ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5 mr-3" />
                              Update Profile
                            </>
                          )}
                        </span>
                        <motion.div 
                          className="absolute inset-0 bg-primary-foreground/10"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
