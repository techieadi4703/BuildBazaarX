import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";

const SPECIALIZATIONS = [
  "Modular Kitchen", "Bedroom", "Living Room", "Bathroom",
  "Full Home", "Office Interior", "Kids Room", "Pooja Room", "Wardrobe"
];

export default function DesignerSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "", // Fetched from session 
    city: "",
    yearsOfExperience: "",
    bio: "",
    specializations: [] as string[]
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/designer/auth");
        return;
      }
      setUserId(session.user.id);
      setForm(prev => ({ ...prev, email: session.user.email || "" }));
      
      // If they already have a profile, redirect to dashboard
      const { data } = await supabase
        .from("designers")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (data) {
        navigate("/designer/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSpecializationToggle = (spec: string) => {
    setForm(prev => {
      const isSelected = prev.specializations.includes(spec);
      if (isSelected) {
        return { ...prev, specializations: prev.specializations.filter(s => s !== spec) };
      } else {
        return { ...prev, specializations: [...prev.specializations, spec] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (form.specializations.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select at least one specialization.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("designers")
        .insert({
          id: userId,
          full_name: form.fullName,
          phone: form.phone,
          email: form.email,
          city: form.city,
          years_experience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : 0,
          bio: form.bio || null,
          specializations: form.specializations,
        });

      if (error) throw error;

      toast({
        title: "Profile configured!",
        description: "Your designer profile is ready.",
      });
      navigate("/designer/dashboard");
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
            <CardTitle>Complete Your Designer Profile</CardTitle>
            <CardDescription>We need your details to get you set up.</CardDescription>
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
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input 
                    id="yearsOfExperience" 
                    type="number"
                    min="0"
                    required
                    value={form.yearsOfExperience}
                    onChange={(e) => setForm({...form, yearsOfExperience: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Specializations</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {SPECIALIZATIONS.map(spec => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`setup-spec-${spec}`} 
                          checked={form.specializations.includes(spec)}
                          onCheckedChange={() => handleSpecializationToggle(spec)}
                        />
                        <Label htmlFor={`setup-spec-${spec}`} className="font-normal text-sm">{spec}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Brief Bio (Optional)</Label>
                  <Textarea 
                    id="bio" 
                    maxLength={400} 
                    placeholder="Tell us about your design style... (Max 400 chars)"
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
