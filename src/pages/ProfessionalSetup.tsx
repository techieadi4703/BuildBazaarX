import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";

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

export default function ProfessionalSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: "",
    profession: "",
    phone: "",
    city: "",
    address: "",
    pincode: "",
    hourlyRate: "",
    dailyRate: "",
    bio: ""
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/professional/auth");
        return;
      }
      setUserId(session.user.id);
      
      // If they already have a profile, redirect to dashboard
      const { data } = await supabase
        .from("professionals")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (data) {
        navigate("/professional/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("professionals")
        .insert({
          id: userId,
          full_name: form.fullName,
          profession: form.profession,
          phone: form.phone,
          city: form.city,
          address: form.address || null,
          pincode: form.pincode || null,
          hourly_rate: form.hourlyRate ? parseInt(form.hourlyRate) : null,
          daily_rate: form.dailyRate ? parseInt(form.dailyRate) : null,
          bio: form.bio || null,
        });

      if (error) throw error;

      toast({
        title: "Profile configured!",
        description: "Your professional profile is ready.",
      });
      navigate("/professional/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error setting up profile",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Complete Your Professional Profile</CardTitle>
            <CardDescription>We need a few more details to get you set up.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    required 
                    value={form.fullName}
                    onChange={(e) => setForm({...form, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Select 
                    required 
                    value={form.profession}
                    onValueChange={(val) => setForm({...form, profession: val})}
                  >
                    <SelectTrigger id="profession">
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
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    required 
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    required 
                    value={form.city}
                    onChange={(e) => setForm({...form, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Input 
                    id="address" 
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode (Optional)</Label>
                  <Input 
                    id="pincode" 
                    value={form.pincode}
                    onChange={(e) => setForm({...form, pincode: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (₹) (Optional)</Label>
                  <Input 
                    id="hourlyRate" 
                    type="number"
                    min="0"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({...form, hourlyRate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Daily Rate (₹) (Optional)</Label>
                  <Input 
                    id="dailyRate" 
                    type="number"
                    min="0"
                    value={form.dailyRate}
                    onChange={(e) => setForm({...form, dailyRate: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Brief Bio (Optional)</Label>
                  <Textarea 
                    id="bio" 
                    maxLength={300} 
                    value={form.bio}
                    onChange={(e) => setForm({...form, bio: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
