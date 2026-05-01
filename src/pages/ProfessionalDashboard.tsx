import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Star, Clock, Calendar, CheckCircle, Mail, User, ListTodo, Wallet, MessageSquare, LogOut, ArrowRight, Save, Trash, X, MapPin } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfessionalDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userId, isLoading: isAuthLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");

  const [newSlot, setNewSlot] = useState({
    date: "",
    startTime: "",
    endTime: ""
  });

  const [skillsInput, setSkillsInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [portfolioInput, setPortfolioInput] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;
    void fetchData();
  }, [isAuthLoading, navigate, user, userId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!user || !userId) {
        navigate("/");
        return;
      }
      // First check role in profiles table to avoid mis-redirection
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profileData && profileData.role !== "professional") {
        navigate("/");
        return;
      }

      const { data: profData, error: profError } = await supabase
        .from("professionals")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profError || !profData) {
        navigate("/professional/setup");
        return;
      }
      
      const prof = profData as {
        skills?: string[] | null;
        languages?: string[] | null;
        portfolio_urls?: string[] | null;
        [key: string]: any;
      };
      
      setProfile(prof);
      setSkillsInput((prof.skills || []).join(", "));
      setLanguagesInput((prof.languages || []).join(", "));
      setPortfolioInput((prof.portfolio_urls || []).join(", "));

      const today = new Date().toISOString().split('T')[0];
      const { data: slotsData } = await supabase
        .from("professional_slots")
        .select("*")
        .eq("professional_id", userId)
        .gte("date", today)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      
      if (slotsData) setSlots(slotsData);

      const { data: reviewsData } = await supabase
        .from("professional_reviews")
        .select("*")
        .eq("professional_id", userId)
        .order("created_at", { ascending: false });

      if (reviewsData) setReviews(reviewsData);
    } catch (err: any) {
      console.error("ProfessionalDashboard fetchData error:", err);
      toast({ title: "Load Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const skills = skillsInput.split(",").map(s => s.trim()).filter(s => s);
      const languages = languagesInput.split(",").map(l => l.trim()).filter(l => l);
      const portfolio_urls = portfolioInput.split(",").map(p => p.trim()).filter(p => p);

      const { error: professionalError } = await supabase
        .from("professionals")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
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

      if (professionalError) throw professionalError;

      if (profile.full_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: profile.full_name })
          .eq('id', profile.id);
        if (profileError) throw profileError;
      }
      toast({ title: "Profile synchronized! ✨" });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!newSlot.startTime || !newSlot.endTime) {
      toast({ variant: "destructive", title: "Time Required", description: "Please select both commence and terminate times." });
      return;
    }

    if (newSlot.endTime <= newSlot.startTime) {
      toast({ variant: "destructive", title: "Invalid Time Range", description: "Terminate time must be later than commence time." });
      return;
    }

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
      toast({ title: "Slot added to registry! 📅" });
      setNewSlot({ date: "", startTime: "", endTime: "" });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync failed", description: error.message });
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
      toast({ variant: "destructive", title: "Delete failed", description: error.message });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading || !profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 bg-[#fcf9f6]">
          <div className="w-8 h-8 border-4 border-[#735c00]/20 border-t-[#735c00] rounded-full animate-spin"></div>
          <p className="font-body text-[10px] font-bold uppercase tracking-widest text-[#44474c]">Initializing Registry...</p>
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
      
      <div className="bg-[#fcf9f6] text-[#1c1c1a] min-h-screen font-body w-full pb-20 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e2df 1px, transparent 1px), linear-gradient(90deg, #e5e2df 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
        
        <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10">
          
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-start">
            
            {/* Sidebar Controller */}
            <div className="w-full md:w-1/4 shrink-0 sticky top-32">
              <span className="font-headline italic text-2xl text-[#735c00] mb-4 block underline underline-offset-8 decoration-1 decoration-[#c4c6cc]">Control Hub.</span>
              <h1 className="text-6xl font-headline tracking-tight leading-none mb-4">
                Exec. <br/> <span className="italic">Matrix.</span>
              </h1>
              <div className="flex items-center gap-2 mb-8">
                 <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-[8px] uppercase tracking-widest border-[#e5e2df]">{profile.profession}</Badge>
                 <span className="text-[10px] font-bold text-[#74777d]">{profile.years_experience} Yrs Exp</span>
              </div>

              <div className="space-y-4 pt-8 border-t border-[#e5e2df]">
                {[
                  { id: "profile", label: "Registry Identity", icon: User },
                  { id: "slots", label: "Strategic Schedule", icon: Calendar },
                  { id: "earnings", label: "Wallet & Ledger", icon: Wallet },
                  { id: "reviews", label: "Collaborator Feedback", icon: MessageSquare },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-5 rounded-sm border transition-all relative group overflow-hidden ${activeTab === item.id ? "text-[#1c1c1a]" : "border-transparent text-[#74777d] hover:text-[#1c1c1a] hover:bg-white/50"}`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-[#735c00]" : ""}`} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
                    </div>
                    {activeTab === item.id ? (
                      <>
                        <motion.div
                          layoutId="active-sidebar-pill"
                          className="absolute inset-0 bg-white border border-[#735c00] shadow-sm z-0"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                        <ArrowRight className="w-3 h-3 text-[#735c00] relative z-10" />
                      </>
                    ) : null}
                  </button>
                ))}
              </div>


              <div className="mt-12 pt-8 border-t border-[#e5e2df]">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-5 text-[#74777d] hover:text-[#1c1c1a] transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Liquidate Session</span>
                </button>
              </div>
            </div>

            {/* Content Core */}
            <div className="w-full md:w-3/4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-[#e5e2df] p-8 md:p-12 rounded-sm shadow-sm min-h-[600px]"
                >
                  
                  {/* REGISTRY IDENTITY */}
                  {activeTab === "profile" && (
                    <div className="space-y-12">
                      <header className="flex items-center justify-between border-b border-[#e5e2df] pb-8">
                        <div>
                           <h2 className="text-4xl font-headline tracking-tight mb-2">Registry <span className="italic">Identity.</span></h2>
                           <p className="text-xs font-body text-[#74777d]">Authenticated operational parameters for {profile.full_name}.</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[8px] font-bold uppercase tracking-widest text-[#74777d]">Status:</span>
                           <button 
                             onClick={() => setProfile({...profile, is_available: !profile.is_available})}
                             className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all ${profile.is_available ? "bg-[#735c00] border-[#735c00] text-white" : "border-[#e5e2df] text-[#74777d]"}`}
                           >
                             {profile.is_available ? "Active Presence" : "Encrypted (Hidden)"}
                           </button>
                        </div>
                      </header>

                      <form onSubmit={handleUpdateProfile} className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                           <div className="space-y-2 opacity-60 cursor-not-allowed">
                             <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Verified Nomenclature</label>
                             <input value={profile.full_name} disabled className="w-full px-4 py-4 bg-[#fcf9f6] border border-[#e5e2df] rounded-sm text-sm outline-none font-body" />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Operational Sector *</label>
                             <input value={profile.profession} onChange={e => setProfile({...profile, profession: e.target.value})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Hourly Rate (₹)</label>
                                <input type="number" value={profile.hourly_rate} onChange={e => setProfile({...profile, hourly_rate: parseInt(e.target.value)})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Daily Shift (₹)</label>
                                <input type="number" value={profile.daily_rate} onChange={e => setProfile({...profile, daily_rate: parseInt(e.target.value)})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                              </div>
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Federal City</label>
                             <input value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                           </div>
                        </div>

                        <div className="space-y-10">
                           <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Technical Proficiencies (Comma Separatory)</label>
                             <input value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="Structural Wiring, Civil Foundations..." className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                           </div>

                           <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Professional Narrative (Bio)</label>
                             <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows={4} placeholder="Decades of specialized execution in..." className="w-full p-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors resize-none" />
                           </div>
                        </div>

                        <div className="flex justify-end pt-8 border-t border-[#e5e2df]">
                           <button type="submit" className="h-14 px-12 bg-[#1c1c1a] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#735c00] transition-all shadow-md">Execute Profile Sync</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* STRATEGIC SCHEDULE */}
                  {activeTab === "slots" && (
                    <div className="space-y-12">
                      <header className="border-b border-[#e5e2df] pb-8">
                         <h2 className="text-4xl font-headline tracking-tight mb-2">Strategic <span className="italic">Schedule.</span></h2>
                         <p className="text-xs font-body text-[#74777d]">Allocate time vectors for client engagement.</p>
                      </header>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                         <div className="lg:col-span-12 xl:col-span-6 2xl:col-span-6 space-y-8 p-10 bg-white/90 border border-black/5 shadow-sm rounded-3xl">
                            <h3 className="text-[11px] uppercase font-black tracking-[0.25em] text-[#0B132B]">Mark Availability</h3>
                            <form onSubmit={handleAddSlot} className="space-y-6">
                               <div className="space-y-2">
                                 <label className="text-[10px] uppercase font-black text-[#0B132B]/60 tracking-widest ml-1">Target Date</label>
                                 <input type="date" required min={new Date().toISOString().split('T')[0]} value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})} className="w-full px-5 py-4 bg-secondary/5 border border-border/50 focus:border-primary rounded-2xl text-sm outline-none font-bold placeholder:text-black/40" />
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-[#0B132B]/60 tracking-widest ml-1">Commence</label>
                                    <input type="time" required value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value, endTime: newSlot.endTime && newSlot.endTime <= e.target.value ? "" : newSlot.endTime})} className="w-full px-5 py-4 bg-secondary/5 border border-border/50 focus:border-primary rounded-2xl text-sm outline-none font-black" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-[#0B132B]/60 tracking-widest ml-1">Terminate</label>
                                    <input type="time" required min={newSlot.startTime || undefined} value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime: e.target.value})} className="w-full px-5 py-4 bg-secondary/5 border border-border/50 focus:border-primary rounded-2xl text-sm outline-none font-black" />
                                  </div>
                               </div>
                               <button type="submit" className="w-full py-5 bg-[#0B132B] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-primary transition-all shadow-xl shadow-black/10">Allocate Slot</button>
                            </form>
                         </div>

                         <div className="lg:col-span-12 xl:col-span-6 2xl:col-span-6 space-y-6">
                            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a]">Active Manifest</h3>
                            {slots.length === 0 ? (
                              <div className="py-20 text-center border-2 border-dashed border-[#e5e2df] flex flex-col items-center justify-center opacity-40">
                                 <ListTodo className="w-8 h-8 mb-4" />
                                 <p className="text-[9px] uppercase font-bold tracking-[0.2em]">Zero Slots Allocated</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {slots.map((slot) => (
                                  <div key={slot.id} className="flex items-center justify-between p-5 bg-white border border-[#e5e2df] group hover:border-[#735c00] transition-all">
                                    <div className="flex items-center gap-6">
                                      <div className="w-10 h-10 rounded-full bg-[#f6f3f0] flex items-center justify-center group-hover:bg-[#735c00] group-hover:text-white transition-all">
                                        <Calendar className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">{new Date(slot.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                        <p className="text-[9px] font-bold text-[#74777d] mt-1">{slot.start_time.substring(0,5)} — {slot.end_time.substring(0,5)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       {slot.is_booked ? (
                                         <Badge className="bg-[#735c00] text-white font-bold text-[8px] uppercase tracking-widest border-none px-3">Booked</Badge>
                                       ) : (
                                         <button onClick={() => handleDeleteSlot(slot.id)} className="w-10 h-10 flex items-center justify-center text-[#74777d] hover:text-red-600 transition-colors"><Trash className="w-3 h-3" /></button>
                                       )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                         </div>
                      </div>
                    </div>
                  )}

                  {/* WALSET & LEDGER */}
                  {activeTab === "earnings" && (
                    <div className="space-y-12">
                       <header className="border-b border-[#e5e2df] pb-8">
                          <h2 className="text-4xl font-headline tracking-tight mb-2">Wallet <span className="italic">& Ledger.</span></h2>
                          <p className="text-xs font-body text-[#74777d]">Financial tracking and performance analytics.</p>
                       </header>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {[
                            { label: "Tasks Fulfilled", value: profile.total_jobs, icon: CheckCircle },
                            { label: "Trust Quotient", value: profile.rating, icon: Star, color: "text-[#735c00]" },
                            { label: "Feedback Loop", value: profile.total_reviews, icon: MessageSquare }
                          ].map((stat, i) => (
                            <div key={i} className="p-8 border border-[#e5e2df] bg-[#fcf9f6] text-center space-y-4">
                               <div className="w-10 h-10 bg-white border border-[#e5e2df] rounded-full mx-auto flex items-center justify-center">
                                  <stat.icon className={`w-4 h-4 ${stat.color || ""}`} />
                               </div>
                               <p className="text-[9px] uppercase font-bold tracking-widest text-[#74777d]">{stat.label}</p>
                               <p className="text-4xl font-headline font-black">{stat.value || "0"}</p>
                            </div>
                          ))}
                       </div>

                       <div className="py-24 text-center border border-[#e5e2df] bg-[#f6f3f0] opacity-40">
                          <Wallet className="w-12 h-12 mx-auto mb-4" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Ledger Beta Access Reserved</p>
                       </div>
                    </div>
                  )}

                  {/* COLLABORATOR FEEDBACK */}
                  {activeTab === "reviews" && (
                    <div className="space-y-12">
                       <header className="border-b border-[#e5e2df] pb-8">
                          <h2 className="text-4xl font-headline tracking-tight mb-2">Network <span className="italic">Feedback.</span></h2>
                          <p className="text-xs font-body text-[#74777d]">Audit trail of performance and collaboration quality.</p>
                       </header>

                       {reviews.length === 0 ? (
                         <div className="py-20 text-center opacity-40">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-[9px] uppercase font-bold tracking-widest text-[#1c1c1a]">Zero Feedback Logs Detected</p>
                         </div>
                       ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reviews.map((rev) => (
                              <div key={rev.id} className="p-8 border border-[#e5e2df] group hover:border-[#735c00] transition-all">
                                 <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "text-[#735c00] fill-current" : "text-[#e5e2df]"}`} />
                                    ))}
                                 </div>
                                 <p className="font-body text-sm text-[#44474c] leading-relaxed italic mb-8">"{rev.review}"</p>
                                 <div className="flex justify-between items-center border-t border-[#f6f3f0] pt-4">
                                    <span className="text-[9px] font-black uppercase text-[#735c00]">Verified Operator</span>
                                    <span className="text-[8px] font-bold text-[#c4c6cc]">{new Date(rev.created_at).toLocaleDateString()}</span>
                                 </div>
                              </div>
                            ))}
                         </div>
                       )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </main>
      </div>
    </Layout>
  );
}
