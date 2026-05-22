import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Palette, Box, Grid, List, Plus, LogOut, Layout as LayoutIcon, User, Settings, Image as ImageIcon, CheckCircle, Clock, Star, MessageSquare, ArrowRight, Trash, X, Save, Edit, FileText } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { autoClassifyMaterial } from "@/lib/utils";

export default function DesignerDashboard() {
  const [activeTab, setActiveTab] = useState("gallery");
  const [isUploading, setIsUploading] = useState(false);
  const [editingDesign, setEditingDesign] = useState<any>(null);
  const [designer, setDesigner] = useState<any>(null);
  const [designs, setDesigns] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchDesigner = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/designer/auth");
        return;
      }

      // Role check
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileData && profileData.role !== "designer") {
        navigate("/");
        return;
      }

      // Fetch designer row
      const { data: designerData, error: designerError } = await supabase
        .from("designers")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (designerError) throw designerError;
      if (!designerData) {
        navigate("/designer/setup");
        return;
      }
      setDesigner(designerData);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return;
      }
      console.error("DesignerDashboard error:", err);
      toast({ variant: "destructive", title: "Load Failed", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigner();
  }, []);

  const fetchDesigns = async () => {
    if (!designer?.id) return;
    try {
      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("designer_id", designer.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Designer designs load error:", err);
      toast({ variant: "destructive", title: "Designs Load Failed", description: err.message || "Unable to load your design repository." });
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [designer?.id]);

  useEffect(() => {
    if (!designer?.id) return;

    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("design_reviews")
          .select("id, rating, comment, created_at, profiles(full_name), designs!inner(name, designer_id)")
          .eq("designs.designer_id", designer.id);

        if (error) throw error;
        setReviews(data || []);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Designer reviews load error:", err);
      }
    };

    fetchReviews();
  }, [designer?.id]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!window.confirm("Are you sure you want to terminate this architectural listing? This action is irreversible.")) return;
    
    try {
      const { error } = await supabase
        .from("designs")
        .delete()
        .eq("id", designId);
      
      if (error) throw error;
      toast({ title: "Blueprint Decommissioned", description: "The design record has been removed from the registry." });
      const updatedDesigns = designs.filter((design) => design.id !== designId);
      setDesigns(updatedDesigns);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 bg-transparent">
          <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
          <p className="font-body text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Initializing Studio Matrix...</p>
          <button onClick={handleLogout} className="mt-6 px-6 py-2 text-[9px] uppercase font-bold tracking-widest text-muted-foreground hover:text-foreground border border-white/20 rounded-sm transition-colors glass-subtle">Terminate Session</button>
        </div>
      </Layout>
    );
  }

  if (!designer) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 bg-transparent px-6 text-center">
          <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
          <div className="space-y-2">
            <p className="font-body text-[10px] font-bold uppercase tracking-widest text-foreground">Studio profile unavailable</p>
            <p className="text-sm text-muted-foreground max-w-md">The designer workspace is still syncing or your session needs to be reloaded.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => fetchDesigner()} className="px-6 py-2 text-[9px] uppercase font-bold tracking-widest text-background bg-foreground rounded-sm transition-colors hover:bg-secondary">Retry Load</button>
            <button onClick={handleLogout} className="px-6 py-2 text-[9px] uppercase font-bold tracking-widest text-muted-foreground hover:text-foreground border border-white/20 rounded-sm transition-colors glass-subtle">Terminate Session</button>
          </div>
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
      
      <div className="bg-transparent text-foreground min-h-screen font-body w-full pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e2df 1px, transparent 1px), linear-gradient(90deg, #e5e2df 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }} />
        
        <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10">
          
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-start">
            
            {/* Studio Sidebar */}
            <div className="w-full md:w-1/4 shrink-0 sticky top-32">
              <span className="font-headline italic text-2xl text-secondary mb-4 block underline underline-offset-8 decoration-1 decoration-border">Architectural Hub.</span>
              <h1 className="text-6xl font-headline tracking-tight leading-none mb-4">
                Creative <br/> <span className="italic">Manifest.</span>
              </h1>
              <div className="flex items-center gap-2 mb-8">
                 <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-[8px] uppercase tracking-widest border-white/20 glass-subtle text-foreground">{designer?.is_verified ? "Verified Bureau" : "Candidate Registry"}</Badge>
              </div>

              <div className="space-y-4 pt-8 border-t border-white/20">
                {[
                  { id: "gallery", label: "Design Repository", icon: Grid },
                  { id: "upload", label: "Publish Blueprint", icon: Plus },
                  { id: "profile", label: "Studio Identity", icon: User },
                  { id: "reviews", label: "Network Feedback", icon: Star },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setEditingDesign(null); }}
                    className={`w-full flex items-center justify-between p-5 rounded-sm border transition-all relative group overflow-hidden ${activeTab === item.id ? "text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/10"}`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-secondary" : ""}`} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
                    </div>
                    {activeTab === item.id ? (
                      <>
                        <motion.div
                          layoutId="active-sidebar-pill"
                          className="absolute inset-0 glass border border-secondary shadow-sm z-0"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                        <ArrowRight className="w-3 h-3 text-secondary relative z-10" />
                      </>
                    ) : null}
                  </button>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-white/20">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-5 text-muted-foreground hover:text-foreground transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Terminate Session</span>
                </button>
              </div>
            </div>

            {/* Stage Core */}
            <div className="w-full md:w-3/4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel p-8 md:p-12 min-h-[600px]"
                >
                  {activeTab === "gallery" && (
                    <div className="space-y-12">
                      <header className="flex items-center justify-between border-b border-white/20 pb-8">
                        <div>
                           <h2 className="text-4xl font-headline tracking-tight mb-2">Design <span className="italic">Repository.</span></h2>
                           <p className="text-xs font-body text-muted-foreground">Authenticated blueprints and active architectural listings.</p>
                        </div>
                        <button onClick={() => setActiveTab("upload")} className="h-12 px-8 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-secondary hover:text-white transition-colors shadow-lg flex items-center gap-3">
                           <Plus className="w-4 h-4" /> New Vision
                        </button>
                      </header>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {designs?.map((design) => (
                          <div key={design.id} className="group relative glass-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-lg">
                              <div className="aspect-[4/3] bg-white/10 dark:bg-white/5 mb-6 overflow-hidden relative rounded-lg border border-white/10">
                                 <img src={design.images && design.images.length > 0 ? design.images[0] : ""} alt={design.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                 <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setEditingDesign(design); setActiveTab("upload"); }} className="w-10 h-10 glass border border-white/25 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors rounded-sm" title="Edit Design"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteDesign(design.id)} className="w-10 h-10 glass border border-white/25 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors rounded-sm" title="Delete Design"><Trash className="w-4 h-4" /></button>
                                 </div>
                              </div>
                              <div className="flex justify-between items-start mb-4">
                                 <div>
                                    <h3 className="text-xl font-headline font-bold mb-1">{design.name}</h3>
                                    <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">{design.category}</span>
                                 </div>
                                 <span className="text-sm font-bold">₹{design.total_cost?.toLocaleString() || "0"}</span>
                              </div>
                              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                 <Badge variant="outline" className={`rounded-none text-[8px] font-bold uppercase tracking-[0.2em] border-none px-0 ${design.is_published ? "text-green-600" : "text-muted-foreground"}`}>
                                    {design.is_published ? "● Active Listing" : "● Draft Status"}
                                 </Badge>
                                 <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">UID: {design.id.substring(0, 8)}</span>
                              </div>
                          </div>
                        ))}
                        {designs?.length === 0 && (
                          <div className="col-span-full py-24 text-center border border-dashed border-white/20 glass-card flex flex-col items-center justify-center opacity-70">
                             <ImageIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                             <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground">Registry Currently Void</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "upload" && (
                    <UploadDesignSection 
                      designerId={designer?.id ?? ""} 
                      editingDesign={editingDesign}
                      onComplete={async () => { await fetchDesigns(); setActiveTab("gallery"); setEditingDesign(null); }} 
                      onCancel={() => { setActiveTab("gallery"); setEditingDesign(null); }}
                    />
                  )}

                  {activeTab === "profile" && designer && <DesignerProfileSection designer={designer} />}

                  {activeTab === "reviews" && (
                    <div className="space-y-12">
                      <header className="border-b border-white/20 pb-8">
                         <h2 className="text-4xl font-headline tracking-tight mb-2">Network <span className="italic">Feedback.</span></h2>
                         <p className="text-xs font-body text-muted-foreground">Audit trail of public engagement and design validation.</p>
                      </header>
                      
                      {reviews?.length === 0 ? (
                        <div className="py-24 text-center border border-white/20 glass-card opacity-70">
                           <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                           <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground">Zero Reviews Logs Detected</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {reviews?.map((review) => (
                            <div key={review.id} className="p-8 border border-white/25 glass-card group hover:border-secondary/50 transition-colors relative">
                               <div className="flex items-center gap-1 mb-6">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-secondary fill-current" : "text-white/20"}`} />
                                  ))}
                                </div>
                               <p className="font-body text-sm text-foreground/80 leading-relaxed italic mb-8">"{review.comment}"</p>
                               <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                  <div>
                                     <span className="text-[9px] font-black uppercase text-foreground block">{review.profiles?.full_name || "Verified Client"}</span>
                                     <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">{review.designs?.name}</span>
                                  </div>
                                  <span className="text-[8px] font-bold text-muted-foreground/60">{new Date(review.created_at).toLocaleDateString()}</span>
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

// SUB-COMPONENTS (Feature-Complete)

function UploadDesignSection({ designerId, editingDesign, onComplete, onCancel }: { designerId: string, editingDesign?: any, onComplete: () => Promise<void> | void, onCancel: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: editingDesign?.name || "", 
    description: editingDesign?.description || "", 
    category: editingDesign?.category || "Living Room", 
    room_size: editingDesign?.room_size || "", 
    style: editingDesign?.style || "Modern", 
    total_cost: editingDesign?.total_cost?.toString() || "",
    execution_cost: editingDesign?.execution_cost?.toString() || "", 
    materials_cost: editingDesign?.materials_cost?.toString() || "", 
    customize_cost: editingDesign?.customize_cost?.toString() || "", 
    timeline: editingDesign?.timeline || "6 Weeks", 
    warranty: editingDesign?.warranty || "10 Year Limited", 
    features: editingDesign?.features?.join(", ") || "", 
    tags: editingDesign?.tags?.join(", ") || ""
  });
  const [materials, setMaterials] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(editingDesign?.images || []);
  const [existingImages, setExistingImages] = useState<string[]>(editingDesign?.images || []);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (editingDesign?.id) {
      const fetchMaterials = async () => {
        const { data } = await supabase.from('design_materials').select('*').eq('design_id', editingDesign.id);
        if (data) setMaterials(data);
      };
      fetchMaterials();
    }
  }, [editingDesign]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files].slice(0, 5));
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    const previewToRemove = imagePreviews[index];
    if (existingImages.includes(previewToRemove)) {
      setExistingImages(prev => prev.filter(img => img !== previewToRemove));
    } else {
      const newFileIndex = imagePreviews.slice(0, index).filter(img => !existingImages.includes(img)).length;
      setImages(prev => prev.filter((_, i) => i !== newFileIndex));
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addMaterialRow = () => {
    setMaterials([...materials, { material_name: "", quantity: "", unit: "nos", notes: "" }]);
  };

  const updateMaterial = (index: number, field: string, value: string) => {
    setMaterials(materials.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length === 0 && existingImages.length === 0) {
      toast({ variant: "destructive", title: "Media Missing", description: "At least one visual blueprint is required." });
      return;
    }

    try {
      const imageUrls: string[] = [];
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('design-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('design-images')
          .getPublicUrl(fileName);
        imageUrls.push(publicUrl);
      }

      const total_cost = (parseInt(formData.execution_cost) || 0) + (parseInt(formData.materials_cost) || 0) + (parseInt(formData.customize_cost) || 0);
      const features_array = formData.features.split(',').map(f => f.trim()).filter(f => f);
      const tags_array = formData.tags.split(',').map(t => t.trim()).filter(t => t);

      const designPayload = {
        designer_id: designerId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        images: [...existingImages, ...imageUrls],
        is_published: true,
        room_size: formData.room_size,
        style: formData.style,
        total_cost: total_cost || parseInt(formData.total_cost) || 0,
        execution_cost: parseInt(formData.execution_cost) || 0,
        materials_cost: parseInt(formData.materials_cost) || 0,
        customize_cost: parseInt(formData.customize_cost) || 0,
        timeline: formData.timeline,
        warranty: formData.warranty,
        features: features_array,
        tags: tags_array
      };

      let designData;
      if (editingDesign?.id) {
        const { data, error } = await supabase.from('designs').update(designPayload).eq('id', editingDesign.id).select().single();
        if (error) {
           toast({ variant: "destructive", title: "Update Restricted", description: `Cannot modify design: ${error.message}` });
           throw error;
        }
        designData = data;
        
        // Delete existing materials so they don't duplicate on update
        const { error: delError } = await supabase.from('design_materials').delete().eq('design_id', designData.id);
        if (delError) {
          console.error("BoM delete error:", delError);
          toast({ variant: "destructive", title: "Storage Policy Restricted", description: `Cannot delete legacy materials: ${delError.message}` });
        }
      } else {
        const { data, error } = await supabase.from('designs').insert(designPayload).select().single();
        if (error) {
           toast({ variant: "destructive", title: "Creation Restricted", description: `Cannot create design: ${error.message}` });
           throw error;
        }
        designData = data;
      }

      if (designData && materials.length > 0) {
        const materialRows = materials.map(m => ({
          design_id: designData.id,
          material_name: m.material_name,
          category: m.category || autoClassifyMaterial(m.material_name),
          quantity: parseFloat(m.quantity) || 0,
          unit: m.unit || "nos",
          notes: m.notes
        })).filter(m => m.material_name && m.quantity > 0);

        if (materialRows.length > 0) {
          const { error: matError } = await supabase.from('design_materials').insert(materialRows);
          if (matError) {
             console.error("BoM upload error:", matError);
             toast({ variant: "destructive", title: "BoM Sync Failed", description: matError.message });
          }
        }
      }

      toast({ title: "Blueprint Synchronized!", description: "Your vision and technical specs are now live." });
      queryClient.invalidateQueries({ queryKey: ["designer-designs"] });
      await onComplete();
    } catch (error: any) {
      console.error("Publication error:", error);
      toast({ variant: "destructive", title: "Publication Failed", description: error.message || "An unexpected error occurred." });
    }
  };

  return (
    <div className="space-y-12">
       <header className="flex items-center justify-between border-b border-white/20 pb-8">
          <div>
             <h2 className="text-4xl font-headline tracking-tight mb-2">{editingDesign ? "Refine" : "Publish"} <span className="italic">Vision.</span></h2>
             <p className="text-xs font-body text-muted-foreground">Deposit architectural blueprints into the global registry.</p>
          </div>
          {editingDesign && (
            <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-full transition-colors text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
              <X className="w-4 h-4" /> Terminate Refinement
            </button>
          )}
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-10">
             <div className="flex items-center gap-6 mb-8">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${step >= i ? "bg-foreground text-background" : "border border-white/20 text-muted-foreground/60 glass"}`}>{i}</div>
                     <span className={`text-[10px] uppercase font-bold tracking-widest ${step >= i ? "text-foreground" : "text-muted-foreground/60"}`}>{i === 1 ? "Logic" : "Media"}</span>
                  </div>
                ))}
             </div>

             {step === 1 ? (
                <div className="space-y-8">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Design Name</label>
                       <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm transition-all text-foreground" placeholder="E.g. Brutalist Loft 01" />
                    </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Architectural Style</label>
                        <select value={formData.style} onChange={e => setFormData({...formData, style: e.target.value})} className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm text-sm text-foreground">
                           {["Modern", "Traditional", "Minimal", "Luxury", "Contemporary"].map(s => <option key={s} className="bg-background text-foreground">{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Sector</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm text-sm text-foreground">
                           {["Living Room", "Bedroom", "Kitchen", "Office", "Full Home"].map(c => <option key={c} className="bg-background text-foreground">{c}</option>)}
                        </select>
                      </div>
                   </div>
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Architectural Footprint (Room Size)</label>
                        <input required value={formData.room_size} onChange={e => setFormData({...formData, room_size: e.target.value})} className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm transition-all text-foreground" placeholder="E.g. 15x20 ft" />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Project Timeline</label>
                          <input required value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm transition-all text-foreground" placeholder="E.g. 6 Weeks" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Warranty Coverage</label>
                          <input required value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm transition-all text-foreground" placeholder="E.g. 10 Year Limited" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Conceptual Manifest (Description)</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full p-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm resize-none text-sm text-foreground" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Discovery Tags (Comma Separated)</label>
                        <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm text-sm text-foreground" placeholder="luxury, modern, loft..." />
                     </div>
                     <button onClick={() => setStep(2)} className="w-full h-14 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-white transition-all">Proceed to Media Allocation</button>
                </div>
             ) : (
                <div className="space-y-8">
                    <div className="space-y-4">
                       <div className="aspect-video bg-white/10 dark:bg-white/5 border border-dashed border-white/30 rounded-lg relative group overflow-hidden glass-card">
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                             <ImageIcon className="w-10 h-10 mb-2 text-muted-foreground" />
                             <p className="text-[9px] uppercase font-bold text-muted-foreground">Assign Visual Blueprints (Max 5)</p>
                          </div>
                          <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                       
                       <div className="grid grid-cols-5 gap-2">
                          {imagePreviews.map((prev, idx) => (
                            <div key={idx} className="relative aspect-square border border-white/20 rounded-md overflow-hidden group glass-card">
                               <img src={prev} className="w-full h-full object-cover" />
                               <button onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                       </div>
                    </div>
                   
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Room Size (sq.ft)</label>
                           <input type="number" value={formData.room_size} onChange={e => setFormData({...formData, room_size: e.target.value})} className="w-full px-4 py-3 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm text-sm text-foreground" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Execution (₹)</label>
                           <input type="number" value={formData.execution_cost} onChange={e => setFormData({...formData, execution_cost: e.target.value})} className="w-full px-4 py-3 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm text-sm text-foreground" />
                        </div>

                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Execution Features (Comma Separated)</label>
                        <textarea value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} rows={2} className="w-full p-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary outline-none rounded-sm resize-none text-sm text-foreground" />
                     </div>

                     <div className="space-y-6 pt-4 border-t border-white/20">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Technical Bill of Materials</label>
                           <button type="button" onClick={addMaterialRow} className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-secondary transition-colors"><Plus className="w-3 h-3" /> Append Specification</button>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                           {materials.map((mat, index) => (
                              <div key={index} className="grid grid-cols-12 gap-3 bg-white/10 dark:bg-white/5 border border-white/10 p-4 group relative rounded-lg">
                                 <div className="col-span-5">
                                    <label className="text-[9px] font-bold uppercase block mb-1">Component Name</label>
                                    <input value={mat.material_name} onChange={e => updateMaterial(index, 'material_name', e.target.value)} className="w-full bg-transparent border-b border-white/20 outline-none text-xs font-bold py-1 text-foreground" />
                                 </div>
                                 <div className="col-span-2">
                                    <label className="text-[9px] font-bold uppercase block mb-1">Quantity</label>
                                    <input type="number" value={mat.quantity} onChange={e => updateMaterial(index, 'quantity', e.target.value)} className="w-full bg-transparent border-b border-white/20 outline-none text-xs font-bold py-1 text-foreground" />
                                 </div>
                                 <div className="col-span-4">
                                    <label className="text-[9px] font-bold uppercase block mb-1">Notes / Grades</label>
                                    <input value={mat.notes} onChange={e => updateMaterial(index, 'notes', e.target.value)} className="w-full bg-transparent border-b border-white/20 outline-none text-xs font-bold py-1 text-foreground" />
                                 </div>
                                 <div className="col-span-1 flex items-end justify-center">
                                    <button type="button" onClick={() => removeMaterial(index)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity pb-1.5"><Trash className="w-3.5 h-3.5" /></button>
                                 </div>
                              </div>
                           ))}
                           {materials.length === 0 && (
                              <p className="text-[9px] italic text-muted-foreground/60 text-center py-6 border border-dashed border-white/10 rounded-lg">No technical components added.</p>
                           )}
                        </div>
                     </div>

                    <div className="flex gap-4">
                       <button onClick={() => setStep(1)} className="flex-1 h-14 glass hover:bg-white/40 text-foreground text-[10px] font-bold uppercase tracking-widest transition-all">Return</button>
                       <button type="button" onClick={handleSubmit} className="flex-[2] h-14 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all">Execute Publication</button>
                    </div>
                </div>
             )}
          </div>
          
          <div className="hidden lg:block glass-card border border-white/20 p-10 relative overflow-hidden">
              <span className="text-[120px] font-black text-white/5 dark:text-white/2 absolute -bottom-10 -right-10 leading-none select-none">STUDIO</span>
              <div className="relative z-10 space-y-8">
                 <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-secondary">Publication Policy</h4>
                 <div className="space-y-6">
                    {[
                      { t: "Originality", d: "Designs must be unique architectural commissions." },
                      { t: "Media Fidelity", d: "High-resolution 16:9 renders preferred for elite indexing." },
                      { t: "Price Integrity", d: "Base pricing must reflect current structural market rates." }
                    ].map((p, i) => (
                      <div key={i}>
                         <p className="text-[9px] font-black uppercase mb-1">{p.t}</p>
                         <p className="text-[10px] leading-relaxed text-muted-foreground">{p.d}</p>
                      </div>
                    ))}
                 </div>
              </div>
          </div>
       </div>
    </div>
  );
}

function DesignerProfileSection({ designer }: { designer: any }) {
  const [formData, setFormData] = useState({ ...designer });
  const [specsInput, setSpecsInput] = useState(designer.specializations?.join(", ") || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const specs = specsInput.split(",").map((s: string) => s.trim()).filter((s: string) => s);
      const { error } = await supabase
        .from("designers")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          specializations: specs,
          years_experience: parseInt(formData.years_experience) || 0
        })
        .eq("id", designer.id);

      if (error) throw error;
      toast({ title: "Studio Profile Updated" });
      queryClient.invalidateQueries({ queryKey: ["designer-profile"] });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  return (
    <div className="space-y-12">
       <header className="border-b border-white/20 pb-8">
          <h2 className="text-4xl font-headline tracking-tight mb-2">Studio <span className="italic">Identity.</span></h2>
          <p className="text-xs font-body text-muted-foreground">Authenticated creative parameters and professional registry.</p>
       </header>

       <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-2 opacity-60 cursor-not-allowed">
             <label className="text-[10px] uppercase font-bold tracking-widest">Nomenclature (Frozen)</label>
             <input disabled value={formData.full_name} className="w-full px-4 py-4 bg-white/10 dark:bg-white/5 border border-white/10 rounded-sm text-sm text-muted-foreground" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Tenure (Years Exp)</label>
             <input type="number" value={formData.years_experience} onChange={e => setFormData({...formData, years_experience: e.target.value})} className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary rounded-sm text-sm outline-none text-foreground" />
          </div>
          <div className="col-span-full space-y-2">
             <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Specialization Matrix (Comma Separated)</label>
             <input value={specsInput} onChange={e => setSpecsInput(e.target.value)} className="w-full px-4 py-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary rounded-sm text-sm outline-none text-foreground" placeholder="Kitchen, Living, Office..." />
          </div>
          <div className="col-span-full space-y-2">
             <label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Studio Narrative (Bio)</label>
             <textarea rows={4} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-4 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 focus:border-secondary rounded-sm text-sm outline-none resize-none text-foreground" />
          </div>
          <div className="col-span-full pt-8 border-t border-white/20 flex justify-end">
             <button type="submit" className="h-14 px-12 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-secondary hover:text-white transition-all">Execute Update</button>
          </div>
       </form>
    </div>
  );
}
