import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { User } from "@supabase/supabase-js";

const BUSINESS_TYPES = [
  "Manufacturer", "Wholesaler", "Retailer", "Distributor", "Importer"
];

export default function SupplierSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [setupForm, setSetupForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    city: "",
    gstNumber: "",
    businessType: ""
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/supplier/auth");
        return;
      }

      setUser(session.user);

      // Check if profile already exists
      const { data } = await supabase
        .from("suppliers")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (data) {
        navigate("/supplier/dashboard");
      } else {
        setIsPageLoading(false);
      }
    };
    checkUser();
  }, [navigate]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!setupForm.businessType) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a Business Type.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("suppliers")
        .insert({
          id: user.id,
          business_name: setupForm.businessName,
          owner_name: setupForm.ownerName,
          phone: setupForm.phone,
          email: user.email!,
          city: setupForm.city,
          gst_number: setupForm.gstNumber || null,
          business_type: setupForm.businessType
        });

      if (error) throw error;

      toast({
        title: "Profile Setup Complete",
        description: "Welcome to your Supplier Dashboard.",
      });
      navigate("/supplier/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[50vh]">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Complete Your Supplier Profile</CardTitle>
            <CardDescription>
              We need a few more details to set up your supplier account before you can start selling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setup-business">Business Name</Label>
                  <Input 
                    id="setup-business" 
                    required 
                    value={setupForm.businessName}
                    onChange={(e) => setSetupForm({...setupForm, businessName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-owner">Owner Name</Label>
                  <Input 
                    id="setup-owner" 
                    required 
                    value={setupForm.ownerName}
                    onChange={(e) => setSetupForm({...setupForm, ownerName: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setup-phone">Phone</Label>
                  <Input 
                    id="setup-phone" 
                    required 
                    value={setupForm.phone}
                    onChange={(e) => setSetupForm({...setupForm, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-city">City</Label>
                  <Input 
                    id="setup-city" 
                    required 
                    value={setupForm.city}
                    onChange={(e) => setSetupForm({...setupForm, city: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setup-gst">GST Number (Optional)</Label>
                  <Input 
                    id="setup-gst" 
                    value={setupForm.gstNumber}
                    onChange={(e) => setSetupForm({...setupForm, gstNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select 
                    value={setupForm.businessType} 
                    onValueChange={(v) => setSetupForm({...setupForm, businessType: v})}
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
                {isLoading ? "Saving..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
