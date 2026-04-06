import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Star, Clock, Calendar, CheckCircle, Trash2, Mail, LayoutDashboard, User, ListTodo, Wallet, MessageSquare, LogOut, ArrowRight, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";

export default function ProfessionalDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newSlot, setNewSlot] = useState({
    date: "",
    startTime: "",
    endTime: ""
  });

  const [skillsInput, setSkillsInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [portfolioInput, setPortfolioInput] = useState("");

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/professional/auth");
      return;
    }
    setUser(session.user);

    const { data: profData, error: profError } = await supabase
      .from("professionals")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profError || !profData) {
      navigate("/professional/setup");
      return;
    }
    
    setProfile(profData);
    setSkillsInput((profData.skills || []).join(", "));
    setLanguagesInput((profData.languages || []).join(", "));
    setPortfolioInput((profData.portfolio_urls || []).join(", "));

    const today = new Date().toISOString().split('T')[0];
    const { data: slotsData } = await supabase
      .from("professional_slots")
      .select("*")
      .eq("professional_id", session.user.id)
      .gte("date", today)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    
    if (slotsData) setSlots(slotsData);

    const { data: reviewsData } = await supabase
      .from("professional_reviews")
      .select("*")
      .eq("professional_id", session.user.id)
      .order("created_at", { ascending: false });

    if (reviewsData) setReviews(reviewsData);
    
    setIsLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const skills = skillsInput.split(",").map(s => s.trim()).filter(s => s);
      const languages = languagesInput.split(",").map(l => l.trim()).filter(l => l);
      const portfolio_urls = portfolioInput.split(",").map(p => p.trim()).filter(p => p);

      const { error } = await supabase
        .from("professionals")
        .update({
          profession: profile.profession,
          bio: profile.bio,
          city: profile.city,
          address: profile.address,
          pincode: profile.pincode,
          hourly_rate: profile.hourly_rate,
          daily_rate: profile.daily_rate,
          years_experience: profile.years_experience,
          is_available: profile.is_available,
          skills,
          languages,
          portfolio_urls
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast({ title: "Profile updated successfully! ✨" });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("professional_slots")
        .insert({
          professional_id: profile.id,
          date: newSlot.date,
          start_time: newSlot.startTime,
          end_time: newSlot.endTime,
        });

      if (error) throw error;
      toast({ title: "Slot added successfully! 📅" });
      setNewSlot({ date: "", startTime: "", endTime: "" });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error adding slot", description: error.message });
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    try {
      const { error } = await supabase
        .from("professional_slots")
        .delete()
        .eq("id", slotId);

      if (error) throw error;
      toast({ title: "Slot removed." });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error deleting slot", description: error.message });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/professional/auth");
  };

  if (isLoading || !profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
          >
            <Clock className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-xl font-bold text-muted-foreground animate-pulse">Syncing your workspace...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-secondary/10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          
          {/* Header */}
          <div className="mb-12">
            <Reveal width="100%" direction="up">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
                    Welcome, <span className="text-primary">{profile.full_name.split(' ')[0]}</span>
                  </h1>
                  <p className="text-muted-foreground text-xl font-medium">Manage your professional career and bookings.</p>
                </div>
                <div className="flex gap-4">
                  <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px]">
                    {profile.profession}
                  </Badge>
                  <Badge variant="outline" className="px-6 py-2 rounded-full border-accent/20 bg-accent/5 text-accent font-black uppercase tracking-widest text-[10px]">
                    {profile.years_experience} Years Exp
                  </Badge>
                </div>
              </div>
            </Reveal>
          </div>

          <Tabs defaultValue="profile" className="space-y-12">
            <Reveal width="100%" direction="up" delay={0.1}>
              <TabsList className="flex flex-wrap h-auto p-2 bg-background/50 backdrop-blur-xl border border-border/50 rounded-[2rem] gap-2">
                {[
                  { value: "profile", label: "Identity", icon: User },
                  { value: "slots", label: "Schedule", icon: Calendar },
                  { value: "earnings", label: "Wallet", icon: Wallet },
                  { value: "reviews", label: "Feedback", icon: MessageSquare },
                  { value: "account", label: "Settings", icon: LayoutDashboard },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value} 
                    className="flex-1 min-w-[120px] rounded-2xl py-4 font-black uppercase tracking-[0.2em] text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Reveal>

            <AnimatePresence mode="wait">
              <TabsContent value="profile" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-border/50 shadow-2xl bg-background/80 backdrop-blur-xl rounded-[3rem] overflow-hidden">
                    <CardContent className="p-10 md:p-14">
                      <form onSubmit={handleUpdateProfile} className="space-y-12">
                        {/* Availability Toggle */}
                        <RevealItem>
                          <div className="flex items-center justify-between p-8 border border-primary/20 rounded-[2.5rem] bg-primary/5">
                            <div className="space-y-1">
                              <Label className="text-xl font-black text-primary uppercase tracking-tight">Active Availability</Label>
                              <p className="text-muted-foreground font-medium">
                                {profile.is_available ? "Your profile is visible to customers." : "You are currently hidden from search results."}
                              </p>
                            </div>
                            <Switch 
                              checked={profile.is_available} 
                              onCheckedChange={(checked) => setProfile({...profile, is_available: checked})} 
                              className="scale-125"
                            />
                          </div>
                        </RevealItem>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <RevealItem>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Current Profession</Label>
                              <Input 
                                value={profile.profession}
                                onChange={e => setProfile({...profile, profession: e.target.value})}
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              />
                            </div>
                          </RevealItem>
                          <RevealItem>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Years of Experience</Label>
                              <Input 
                                type="number"
                                value={profile.years_experience || 0}
                                onChange={e => setProfile({...profile, years_experience: parseInt(e.target.value)})}
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              />
                            </div>
                          </RevealItem>
                          <RevealItem>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Stationed City</Label>
                              <Input 
                                value={profile.city}
                                onChange={e => setProfile({...profile, city: e.target.value})}
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              />
                            </div>
                          </RevealItem>
                          <RevealItem>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Market Pincode</Label>
                              <Input 
                                value={profile.pincode || ""}
                                onChange={e => setProfile({...profile, pincode: e.target.value})}
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              />
                            </div>
                          </RevealItem>
                          <RevealItem className="md:col-span-2">
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Office/Service Address</Label>
                              <Input 
                                value={profile.address || ""}
                                onChange={e => setProfile({...profile, address: e.target.value})}
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              />
                            </div>
                          </RevealItem>
                          
                          <RevealItem>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Hourly Consultation (₹)</Label>
                              <Input 
                                type="number"
                                value={profile.hourly_rate || ""}
                                onChange={e => setProfile({...profile, hourly_rate: parseInt(e.target.value)})}
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              />
                            </div>
                          </RevealItem>
                          <RevealItem>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Daily Labor Rate (₹)</Label>
                              <Input 
                                type="number"
                                value={profile.daily_rate || ""}
                                onChange={e => setProfile({...profile, daily_rate: parseInt(e.target.value)})}
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              />
                            </div>
                          </RevealItem>

                          <RevealItem>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Key Proficiencies (Comma separated)</Label>
                              <Input 
                                placeholder="Wiring, Plumbing basics..."
                                value={skillsInput}
                                onChange={e => setSkillsInput(e.target.value)}
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              />
                            </div>
                          </RevealItem>
                          <RevealItem>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Languages (Comma separated)</Label>
                              <Input 
                                placeholder="Hindi, English"
                                value={languagesInput}
                                onChange={e => setLanguagesInput(e.target.value)}
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              />
                            </div>
                          </RevealItem>

                          <RevealItem className="md:col-span-2">
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Portfolio Links (Comma separated)</Label>
                              <Input 
                                placeholder="https://..."
                                value={portfolioInput}
                                onChange={e => setPortfolioInput(e.target.value)}
                                className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                              />
                            </div>
                          </RevealItem>

                          <RevealItem className="md:col-span-2">
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Bio</Label>
                              <Textarea 
                                value={profile.bio || ""}
                                onChange={e => setProfile({...profile, bio: e.target.value})}
                                rows={5}
                                className="rounded-[2rem] bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold p-6"
                              />
                            </div>
                          </RevealItem>
                        </div>
                        
                        <div className="flex justify-end pt-10">
                          <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 group relative overflow-hidden">
                            <span className="relative z-10">Sync Profile Updates</span>
                            <motion.div 
                              className="absolute inset-0 bg-primary-foreground/10"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "100%" }}
                              transition={{ duration: 0.5 }}
                            />
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="slots" className="focus-visible:outline-none">
                 <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                  >
                   <div className="lg:col-span-4">
                     <Card className="border-border/50 shadow-xl bg-background rounded-[2.5rem] overflow-hidden">
                       <div className="bg-primary/5 px-8 py-6 border-b border-border/50">
                        <h3 className="text-lg font-black uppercase tracking-tight text-primary flex items-center gap-3">
                          <Calendar className="w-5 h-5" />
                          Mark Availability
                        </h3>
                       </div>
                       <CardContent className="p-8">
                         <form onSubmit={handleAddSlot} className="space-y-8">
                           <div className="space-y-3">
                             <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Date</Label>
                             <Input 
                               type="date" 
                               required 
                               min={new Date().toISOString().split('T')[0]}
                               value={newSlot.date}
                               onChange={e => setNewSlot({...newSlot, date: e.target.value})}
                               className="h-14 rounded-2xl bg-secondary/30 border-transparent font-bold"
                             />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-3">
                               <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Start</Label>
                               <Input 
                                 type="time" 
                                 required 
                                 value={newSlot.startTime}
                                 onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
                                 className="h-14 rounded-2xl bg-secondary/30 border-transparent font-bold"
                               />
                             </div>
                             <div className="space-y-3">
                               <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">End</Label>
                               <Input 
                                 type="time" 
                                 required 
                                 value={newSlot.endTime}
                                 onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
                                 className="h-14 rounded-2xl bg-secondary/30 border-transparent font-bold"
                               />
                             </div>
                           </div>
                           <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg transition-transform hover:scale-105 active:scale-95">Add Slot</Button>
                         </form>
                       </CardContent>
                     </Card>
                   </div>
                   
                   <div className="lg:col-span-8">
                     <Card className="border-border/50 shadow-xl bg-background rounded-[2.5rem] overflow-hidden h-full">
                       <div className="bg-secondary/30 px-8 py-6 border-b border-border/50 flex items-center justify-between">
                         <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Future Schedule</h3>
                         <Badge className="bg-background text-foreground border shadow-sm">Next 7 Days</Badge>
                       </div>
                       <CardContent className="p-8">
                         <AnimatePresence mode="popLayout">
                          {slots.length === 0 ? (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-20 bg-secondary/10 rounded-[2rem] border-2 border-dashed border-border"
                            >
                              <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <ListTodo className="w-10 h-10 text-muted-foreground/30" />
                              </div>
                              <p className="text-muted-foreground font-black text-lg">Your calendar is currently clear.</p>
                              <p className="text-muted-foreground/60 text-sm mt-2">Add availability to receive client bookings.</p>
                            </motion.div>
                          ) : (
                            <div className="space-y-4">
                              {slots.map((slot, idx) => (
                                <motion.div 
                                  key={slot.id}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  layout
                                  className="flex items-center justify-between p-6 bg-secondary/20 rounded-3xl border border-border/30 hover:shadow-lg hover:bg-background transition-all group"
                                >
                                  <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                      <Calendar className="w-7 h-7" />
                                    </div>
                                    <div>
                                      <p className="font-black text-lg">{new Date(slot.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                      <p className="text-sm font-bold text-muted-foreground flex items-center gap-2 mt-1">
                                        <Clock className="w-4 h-4 text-primary" />
                                        {slot.start_time.substring(0,5)} — {slot.end_time.substring(0,5)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    {slot.is_booked ? (
                                      <Badge className="bg-green-500/10 text-green-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px]">
                                        <CheckCircle className="w-3 h-3 mr-2" /> Booked
                                      </Badge>
                                    ) : (
                                      <>
                                        <Badge variant="outline" className="px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">Available</Badge>
                                        <motion.button 
                                          whileHover={{ scale: 1.2, rotate: 10 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => handleDeleteSlot(slot.id)}
                                          className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-all shadow-sm"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </motion.button>
                                      </>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                         </AnimatePresence>
                       </CardContent>
                     </Card>
                   </div>
                 </motion.div>
              </TabsContent>

              <TabsContent value="earnings" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { icon: CheckCircle, label: "Jobs Completed", value: profile.total_jobs, color: "text-blue-600 bg-blue-50" },
                      { icon: Star, label: "Avg. Customer Rating", value: profile.rating, color: "text-yellow-600 bg-yellow-50", extra: <Star className="w-6 h-6 fill-current" /> },
                      { icon: MessageSquare, label: "Positive Reviews", value: profile.total_reviews, color: "text-purple-600 bg-purple-50" }
                    ].map((metric, idx) => (
                      <Card key={idx} className="border-border/50 shadow-xl bg-background rounded-[2.5rem] overflow-hidden group">
                        <CardContent className="p-10 flex flex-col items-center text-center">
                          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:rotate-6 transition-transform ${metric.color}`}>
                            <metric.icon className="w-8 h-8" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">{metric.label}</p>
                          <div className="text-5xl font-black tracking-tighter text-foreground flex items-center gap-3">
                            {metric.value} {metric.extra}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Card className="border-border/50 shadow-2xl bg-background/80 backdrop-blur-xl rounded-[3rem] overflow-hidden">
                    <CardContent className="p-20 flex flex-col items-center justify-center text-center">
                      <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-10 relative">
                        <Wallet className="w-16 h-16 text-primary" />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-primary/20 rounded-full"
                        />
                      </div>
                      <h3 className="text-3xl font-black mb-4 tracking-tight">Finances & Analytics</h3>
                      <p className="text-muted-foreground max-w-xl text-lg font-medium">
                        Your personalized ledger and performance analytics engine is currently being fine-tuned for heavy loads.
                      </p>
                      <Badge className="mt-10 px-8 py-3 rounded-full bg-accent text-accent-foreground font-black uppercase tracking-widest">v2.0 Beta Coming Late 2026</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="reviews" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-border/50 shadow-2xl bg-background rounded-[3rem] overflow-hidden">
                    <div className="bg-primary/5 px-10 py-8 border-b border-border/50 flex items-center justify-between">
                      <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        Reputation Tracker
                      </h3>
                    </div>
                    <CardContent className="p-10">
                      {reviews.length === 0 ? (
                        <div className="text-center py-24 space-y-4">
                          <p className="text-4xl">🕊️</p>
                          <p className="text-muted-foreground text-xl font-bold">No feedback collected yet.</p>
                          <p className="text-muted-foreground/60 max-w-xs mx-auto">Maintain high availability and complete jobs to build your legacy.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {reviews.map((review, idx) => (
                            <motion.div 
                              key={review.id} 
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-secondary/20 p-8 rounded-[2.5rem] border border-border/30 hover:border-primary/20 hover:bg-background transition-all shadow-sm"
                            >
                              <div className="flex items-center gap-1 mb-6">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-5 h-5 ${i < review.rating ? "text-yellow-500 fill-current" : "text-muted"}`} 
                                  />
                                ))}
                              </div>
                              <p className="text-lg font-bold italic text-foreground mb-6 leading-relaxed">"{review.review}"</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="bg-background/80 shadow-sm rounded-full px-4 text-xs font-black uppercase tracking-widest text-primary/80">Verified Client</Badge>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="account" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <Card className="border-border/50 shadow-2xl bg-background rounded-[3rem] overflow-hidden">
                    <div className="bg-destructive/10 px-8 py-6 border-b border-border/50 flex items-center gap-3">
                      <LogOut className="w-6 h-6 text-destructive" />
                      <h3 className="font-black text-destructive text-lg uppercase tracking-tight">Security & Session</h3>
                    </div>
                    <CardContent className="p-12 space-y-10">
                      <div className="flex items-center gap-6 border-2 border-dashed border-border/50 p-8 rounded-[2rem] bg-secondary/10">
                        <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shadow-sm">
                          <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Session Identity</p>
                          <p className="text-xl font-black text-foreground">{user?.email}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-2">Change Workspace Password</Button>
                        <Button variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-destructive/20 group" onClick={handleLogout}>
                          Terminate Professional Session
                          <LogOut className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
