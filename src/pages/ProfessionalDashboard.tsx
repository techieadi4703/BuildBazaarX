import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Star, Clock, Calendar, CheckCircle, Trash2, Mail, ExternalLink } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";

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

    // Fetch profile
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

    // Fetch slots
    const today = new Date().toISOString().split('T')[0];
    const { data: slotsData } = await supabase
      .from("professional_slots")
      .select("*")
      .eq("professional_id", session.user.id)
      .gte("date", today)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    
    if (slotsData) setSlots(slotsData);

    // Fetch reviews
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
      toast({ title: "Profile updated successfully!" });
      fetchData(); // refresh
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
      toast({ title: "Slot added successfully!" });
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
      toast({ title: "Slot deleted." });
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
        <div className="flex items-center justify-center min-h-[50vh]">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Welcome, {profile.full_name}</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-2 p-1">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="slots">My Slots</TabsTrigger>
            <TabsTrigger value="earnings">My Earnings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile Profile</CardTitle>
                <CardDescription>Update your skills, availability, and rates.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="space-y-0.5">
                      <Label className="text-base">Availability Status</Label>
                      <p className="text-sm text-muted-foreground">
                        {profile.is_available ? "You are currently available for work." : "You are hidden from searches currently."}
                      </p>
                    </div>
                    <Switch 
                      checked={profile.is_available} 
                      onCheckedChange={(checked) => setProfile({...profile, is_available: checked})} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Profession</Label>
                      <Input 
                        value={profile.profession}
                        onChange={e => setProfile({...profile, profession: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Years of Experience</Label>
                      <Input 
                        type="number"
                        value={profile.years_experience || 0}
                        onChange={e => setProfile({...profile, years_experience: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input 
                        value={profile.city}
                        onChange={e => setProfile({...profile, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input 
                        value={profile.pincode || ""}
                        onChange={e => setProfile({...profile, pincode: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Input 
                        value={profile.address || ""}
                        onChange={e => setProfile({...profile, address: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Hourly Rate (₹)</Label>
                      <Input 
                        type="number"
                        value={profile.hourly_rate || ""}
                        onChange={e => setProfile({...profile, hourly_rate: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Daily Rate (₹)</Label>
                      <Input 
                        type="number"
                        value={profile.daily_rate || ""}
                        onChange={e => setProfile({...profile, daily_rate: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Skills (Comma separated)</Label>
                      <Input 
                        placeholder="Wiring, Plumbing basics..."
                        value={skillsInput}
                        onChange={e => setSkillsInput(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Languages (Comma separated)</Label>
                      <Input 
                        placeholder="Hindi, English"
                        value={languagesInput}
                        onChange={e => setLanguagesInput(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Portfolio URLs (Comma separated)</Label>
                      <Input 
                        placeholder="https://..."
                        value={portfolioInput}
                        onChange={e => setPortfolioInput(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Bio</Label>
                      <Textarea 
                        value={profile.bio || ""}
                        onChange={e => setProfile({...profile, bio: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-1">
                 <Card>
                   <CardHeader>
                     <CardTitle>Add Availability</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <form onSubmit={handleAddSlot} className="space-y-4">
                       <div className="space-y-2">
                         <Label>Date</Label>
                         <Input 
                           type="date" 
                           required 
                           min={new Date().toISOString().split('T')[0]}
                           value={newSlot.date}
                           onChange={e => setNewSlot({...newSlot, date: e.target.value})}
                         />
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                         <div className="space-y-2">
                           <Label>Start Time</Label>
                           <Input 
                             type="time" 
                             required 
                             value={newSlot.startTime}
                             onChange={e => setNewSlot({...newSlot, startTime: e.target.value})}
                           />
                         </div>
                         <div className="space-y-2">
                           <Label>End Time</Label>
                           <Input 
                             type="time" 
                             required 
                             value={newSlot.endTime}
                             onChange={e => setNewSlot({...newSlot, endTime: e.target.value})}
                           />
                         </div>
                       </div>
                       <Button type="submit" className="w-full">Add Slot</Button>
                     </form>
                   </CardContent>
                 </Card>
               </div>
               
               <div className="md:col-span-2">
                 <Card>
                   <CardHeader>
                     <CardTitle>Upcoming Slots</CardTitle>
                     <CardDescription>Your availability for the next 7 days.</CardDescription>
                   </CardHeader>
                   <CardContent>
                     {slots.length === 0 ? (
                       <p className="text-muted-foreground text-center py-8">No upcoming slots. Add some availability so customers can book you.</p>
                     ) : (
                       <div className="space-y-3">
                         {slots.map(slot => (
                           <div key={slot.id} className="flex items-center justify-between p-3 border rounded-md">
                             <div className="flex items-center gap-4">
                               <div className="bg-primary/10 p-2 rounded-md">
                                 <Calendar className="w-5 h-5 text-primary" />
                               </div>
                               <div>
                                 <p className="font-medium">{new Date(slot.date).toLocaleDateString()}</p>
                                 <p className="text-sm text-muted-foreground flex items-center gap-1">
                                   <Clock className="w-3 h-3" />
                                   {slot.start_time.substring(0,5)} - {slot.end_time.substring(0,5)}
                                 </p>
                               </div>
                             </div>
                             <div className="flex items-center gap-3">
                               {slot.is_booked ? (
                                 <Badge variant="secondary" className="flex items-center gap-1">
                                   <CheckCircle className="w-3 h-3" /> Booked
                                 </Badge>
                               ) : (
                                 <>
                                   <Badge variant="outline">Free</Badge>
                                   <Button variant="ghost" size="icon" onClick={() => handleDeleteSlot(slot.id)}>
                                     <Trash2 className="w-4 h-4 text-destructive" />
                                   </Button>
                                 </>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </div>
             </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Jobs Completed</CardDescription>
                  <CardTitle className="text-4xl">{profile.total_jobs}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Rating</CardDescription>
                  <CardTitle className="text-4xl flex items-center gap-2">
                    {profile.rating} <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Reviews</CardDescription>
                  <CardTitle className="text-4xl">{profile.total_reviews}</CardTitle>
                </CardHeader>
              </Card>
            </div>
            
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Detailed earnings history coming soon.</h3>
                <p className="text-muted-foreground max-w-md">
                  We are working on a comprehensive dashboard giving you full analytics of your transactions and clients.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground">No reviews yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map(review => (
                      <Card key={review.id} className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-current" : "text-muted"}`} 
                              />
                            ))}
                          </div>
                          <p className="mb-2 italic">"{review.review}"</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 border p-4 rounded-md">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </Layout>
  );
}
