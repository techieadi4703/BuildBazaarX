import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, MapPin, Mail, Save, Loader2, Package, ArrowRight, LogOut } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

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

  const handleLogout = async () => {
    setIsSaving(true);
    await supabase.auth.signOut();
    navigate("/");
  };

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
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 bg-transparent">
          <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          <p className="font-body text-sm text-muted-foreground tracking-widest uppercase">Initializing Registry...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        .font-headline { font-family: 'Newsreader', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
      `}</style>
      
      <div className="bg-transparent text-foreground min-h-screen font-body w-full pb-24 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e2df 1px, transparent 1px), linear-gradient(90deg, #e5e2df 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }} />
        
        <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-start">
            
            {/* Sidebar / Header */}
            <div className="w-full md:w-1/3 shrink-0 sticky top-32">
              <span className="font-headline italic text-2xl text-secondary mb-4 block underline underline-offset-8 decoration-1 decoration-border">Control Center.</span>
              <h1 className="text-6xl md:text-7xl font-headline tracking-tight leading-none mb-8">
                Client <br/> <span className="italic">Monograph.</span>
              </h1>
              <div className="w-12 h-[1px] bg-border mb-8"></div>
              <p className="text-lg font-body text-muted-foreground leading-relaxed max-w-sm mb-12">
                Manage your identity and logistical requisitions within the BuildBazaarX network.
              </p>
              
              <div className="space-y-4">
                <Link to="/orders" className="group flex items-center justify-between p-6 glass-card border-white/20 hover:border-secondary/50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 max-w-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-secondary block mb-1">Logistics</span>
                      <span className="text-sm font-semibold">Active Requisitions</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                </Link>

                <button onClick={handleLogout} className="group w-full flex items-center justify-between p-6 glass-card border-red-500/20 hover:border-red-500/50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 max-w-sm cursor-pointer text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <LogOut className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 block mb-1">Session</span>
                      <span className="text-sm font-semibold text-red-600">Terminate Access</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-red-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Main Form Area */}
            <div className="w-full md:w-2/3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 md:p-12 relative overflow-hidden"
              >
                <form onSubmit={handleUpdate} className="space-y-12">
                  
                  {/* Account Matrix */}
                  <section className="space-y-8">
                    <header className="flex items-center gap-4 border-b border-white/20 pb-4">
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-secondary">Operational Sector: {currentRole.toUpperCase()}</h3>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-foreground opacity-60">Full Nomenclature</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            required
                            type="text"
                            value={profile.full_name}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            placeholder="Your Name"
                            className="w-full pl-10 pr-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary rounded-sm text-sm outline-none font-body transition-colors text-foreground"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-foreground opacity-60">Telecom Sequence</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            required
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="+91 XXXXX XXXXX"
                            className="w-full pl-10 pr-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary rounded-sm text-sm outline-none font-body transition-colors text-foreground"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-foreground opacity-60">Verified Credentials</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <input
                          value={user?.email || ""}
                          disabled
                          className="w-full pl-10 pr-4 py-4 bg-white/10 dark:bg-white/5 border border-white/20 text-muted-foreground rounded-sm text-sm font-body cursor-not-allowed opacity-60"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <span className="text-[10px] uppercase font-bold tracking-tighter text-secondary">Verified Identity</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Logistical Vector */}
                  <section className="space-y-8 pt-6">
                    <header className="flex items-center gap-4 border-b border-white/20 pb-4">
                      <div className="w-2 h-2 rounded-full bg-foreground"></div>
                      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-foreground">Logistical Vector</h3>
                    </header>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-foreground opacity-60">Structural Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-5 w-4 h-4 text-muted-foreground" />
                        <textarea
                          value={profile.address}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          placeholder="House No, Street Name, Area / Landmark..."
                          rows={3}
                          className="w-full pl-10 pr-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary rounded-sm text-sm outline-none font-body transition-colors text-foreground min-h-[120px] resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-foreground opacity-60">Operational City</label>
                        <input
                          type="text"
                          value={profile.city}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          placeholder="Your City"
                          className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary rounded-sm text-sm outline-none font-body transition-colors text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-foreground opacity-60">Federal State</label>
                        <input
                          type="text"
                          value={profile.state}
                          onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                          placeholder="State / Region"
                          className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary rounded-sm text-sm outline-none font-body transition-colors text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 max-w-xs">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-foreground opacity-60">Postal Code</label>
                      <input
                        type="text"
                        value={profile.pincode}
                        onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                        placeholder="6-Digit Register"
                        maxLength={6}
                        className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary rounded-sm text-sm outline-none font-body transition-colors text-foreground"
                      />
                    </div>
                  </section>

                  {/* Submission Flow */}
                  <div className="pt-12 border-t border-white/20 flex justify-end">
                    <button 
                      type="submit" 
                      className="group relative h-14 px-12 bg-foreground text-background overflow-hidden shadow-lg hover:shadow-2xl transition-all rounded-sm disabled:opacity-50"
                      disabled={isSaving}
                    >
                      <span className="relative z-10 font-body text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Synchronizing...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Update Registry
                          </>
                        )}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 h-0 bg-secondary group-hover:h-full transition-all duration-300" />
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>

          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Profile;
