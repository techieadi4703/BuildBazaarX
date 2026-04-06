import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, UploadCloud, FileImage, Trash2, Edit2, CheckCircle, Mail, MoreVertical, Sparkles, LayoutDashboard, Palette, CloudUpload, User, MessageSquare, LogOut, ArrowRight, Star, Eye, Zap, ListTodo, MapPin } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = [
  "Modular Kitchen", "Bedroom", "Living Room", "Bathroom",
  "Full Home", "Office Interior", "Kids Room", "Pooja Room", "Wardrobe"
];

const STYLES = ["Modern", "Luxury", "Minimal", "Traditional", "Contemporary", "Industrial"];

const UNITS = ["sq.ft", "kg", "ltr", "nos", "rmt"];

const SPECIALIZATIONS = [
  "Modular Kitchen", "Bedroom", "Living Room", "Bathroom",
  "Full Home", "Office Interior", "Kids Room", "Pooja Room", "Wardrobe"
];

export default function DesignerDashboard() {
  const [activeTab, setActiveTab] = useState("designs");
  const [editingDesign, setEditingDesign] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isDesignerValid, setIsDesignerValid] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/designer/auth");
        return;
      }
      setUser(session.user);
      
      const { data: designerData } = await supabase
        .from('designers')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!designerData) {
        navigate("/designer/setup"); // Redirect if profile doesn't exist
        return;
      }
      setIsDesignerValid(true);
    };
    init();
  }, [navigate]);

  if (!user || isDesignerValid === null) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
          >
            <Palette className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-xl font-bold text-muted-foreground animate-pulse">Entering the creative suite...</p>
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
                    Designer <span className="text-primary tracking-tighter">Studio</span>
                  </h1>
                  <p className="text-muted-foreground text-xl font-medium max-w-2xl">Create, showcase, and manage your high-end architectural visions.</p>
                </div>
                <div className="flex gap-4">
                  <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px]">
                    Elite Designer
                  </Badge>
                  <Button size="lg" className="rounded-2xl font-black shadow-lg shadow-primary/20 group" onClick={() => setActiveTab("upload")}>
                    <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                    New Creation
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
            <Reveal width="100%" direction="up" delay={0.1}>
              <TabsList className="flex flex-wrap h-auto p-2 bg-background/50 backdrop-blur-xl border border-border/50 rounded-[2rem] gap-2">
                {[
                  { value: "designs", label: "My Gallery", icon: Palette },
                  { value: "upload", label: "Publish", icon: CloudUpload },
                  { value: "profile", label: "Identity", icon: User },
                  { value: "reviews", label: "Critique", icon: MessageSquare },
                  { value: "account", label: "Portal", icon: LayoutDashboard },
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
              <TabsContent value="designs" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <MyDesignsSection 
                    userId={user.id} 
                    onGoToUpload={() => {
                      setEditingDesign(null);
                      setActiveTab("upload");
                    }} 
                    onEdit={(design) => {
                      setEditingDesign(design);
                      setActiveTab("upload");
                    }}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="upload" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <UploadDesignSection 
                    userId={user.id} 
                    editingDesign={editingDesign}
                    onSuccess={() => {
                      setEditingDesign(null);
                      setActiveTab("designs");
                    }} 
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="profile" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <DesignerProfileSection userId={user.id} />
                </motion.div>
              </TabsContent>

              <TabsContent value="reviews" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <DesignerReviewsSection userId={user.id} />
                </motion.div>
              </TabsContent>

              <TabsContent value="account" className="focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
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
                        <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2">Request Vault Access</Button>
                        <Button variant="destructive" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-destructive/20 group" onClick={async () => {
                          await supabase.auth.signOut();
                          navigate("/designer/auth");
                        }}>
                          Logout of Creative Studio
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

// ---------------------------------------------------------------------------
// SECTION: My Designs
// ---------------------------------------------------------------------------
function MyDesignsSection({ userId, onGoToUpload, onEdit }: { userId: string, onGoToUpload: () => void, onEdit: (design: any) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: designs, isLoading } = useQuery({
    queryKey: ['designer-designs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('designer_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ designId, isPublished }: { designId: string, isPublished: boolean }) => {
      const { error } = await supabase.from('designs').update({ is_published: isPublished }).eq('id', designId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designer-designs', userId] });
      toast({ title: "Status Synchronized! ✨" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Sync failed", description: err.message });
    }
  });

  if (isLoading) return <div className="flex justify-center py-20 animate-pulse font-bold text-muted-foreground uppercase tracking-widest text-xs">Curating Gallery...</div>;

  return (
    <div className="space-y-10">
      {!designs || designs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-24 text-center rounded-[4rem] border-2 border-dashed border-border/50 bg-background/50 backdrop-blur-xl">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
            <FileImage className="w-12 h-12 text-primary opacity-50" />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-4">No Creations Yet</h3>
          <p className="text-muted-foreground mb-10 max-w-sm font-medium">Your design legacy starts here. Upload your first masterpiece to the catalog.</p>
          <Button onClick={onGoToUpload} size="lg" className="rounded-2xl font-black px-12 group">
            Start First Project
            <Plus className="ml-3 w-5 h-5 group-hover:rotate-90 transition-transform" />
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {designs.map((design, idx) => (
            <motion.div
              key={design.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="overflow-hidden group border-border/50 shadow-xl bg-background rounded-[2.5rem] hover:border-primary/30 transition-all">
                <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
                  {design.images && design.images.length > 0 ? (
                    <img 
                      src={design.images[0]} 
                      alt={design.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest opacity-20">Preview Missing</div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className={`${design.is_published ? "bg-primary text-white" : "bg-background/80 backdrop-blur-md text-foreground"} px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] shadow-lg`}>
                      {design.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <p className="text-white font-black text-xl tracking-tight leading-tight line-clamp-1">{design.name}</p>
                  </div>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-black uppercase text-[9px] px-3">
                      {design.category}
                    </Badge>
                    {design.style && (
                       <Badge variant="outline" className="rounded-full border-accent/20 text-accent font-black uppercase text-[9px] px-3">
                        {design.style}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 border-t border-border/30 pt-6">
                    <div className="text-center">
                      <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground mb-1">Impact</p>
                      <p className="text-lg font-black text-primary flex items-center justify-center gap-1">
                        <Eye className="w-4 h-4" /> {design.view_count || 0}
                      </p>
                    </div>
                    <div className="text-center border-x border-border/30">
                      <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground mb-1">Reputation</p>
                      <p className="text-lg font-black text-accent flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-current" /> {design.rating || "-"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground mb-1">Est. Value</p>
                      <p className="text-sm font-black text-foreground">₹{(design.total_cost / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 flex gap-3">
                  <Button 
                    variant={design.is_published ? "outline" : "default"} 
                    className="flex-1 rounded-2xl font-black h-12 uppercase tracking-widest text-[10px]" 
                    size="sm" 
                    onClick={() => {
                      togglePublishMutation.mutate({ designId: design.id, isPublished: !design.is_published });
                    }}
                  >
                    {design.is_published ? "Unpublish" : "Go Public"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="rounded-2xl w-12 h-12 p-0 bg-secondary/30" size="icon">
                        <MoreVertical className="w-5 h-5"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[180px]">
                      <DropdownMenuItem className="rounded-xl p-3 font-bold cursor-pointer" onClick={() => navigate(`/designs/db-${design.id}`)}>
                        <Eye className="w-4 h-4 mr-3" /> View Public
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl p-3 font-bold cursor-pointer" onClick={() => onEdit(design)}>
                        <Edit2 className="w-4 h-4 mr-3" /> Edit Studio
                      </DropdownMenuItem>
                      <Separator className="my-2" />
                      <DropdownMenuItem className="rounded-xl p-3 font-bold text-destructive hover:bg-destructive/10 cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-3" /> Archive Design
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SECTION: Upload Design
// ---------------------------------------------------------------------------
function UploadDesignSection({ userId, editingDesign, onSuccess }: { userId: string, editingDesign?: any, onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [style, setStyle] = useState("");
  const [roomSize, setRoomSize] = useState("");
  const [description, setDescription] = useState("");
  
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [executionCost, setExecutionCost] = useState("");
  const [materialsCost, setMaterialsCost] = useState("");
  const [customizeCost, setCustomizeCost] = useState("");
  
  const [timeline, setTimeline] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Materials list
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    if (editingDesign) {
      setName(editingDesign.name || "");
      setCategory(editingDesign.category || "");
      setStyle(editingDesign.style || "");
      setRoomSize(editingDesign.room_size || "");
      setDescription(editingDesign.description || "");
      setFeatures(editingDesign.features || []);
      setTags(editingDesign.tags || []);
      setExecutionCost(editingDesign.execution_cost?.toString() || "");
      setMaterialsCost(editingDesign.materials_cost?.toString() || "");
      setCustomizeCost(editingDesign.customize_cost?.toString() || "");
      setTimeline(editingDesign.timeline || "");
      setExistingImages(editingDesign.images || []);
      
      // Fetch materials for this design
      const fetchMats = async () => {
        const { data } = await supabase.from('design_materials').select('*').eq('design_id', editingDesign.id);
        if (data) setMaterials(data.map(m => ({ ...m, id: m.id })));
      };
      fetchMats();
    } else {
      // Reset form for new upload
      setName("");
      setCategory("");
      setStyle("");
      setRoomSize("");
      setDescription("");
      setFeatures([]);
      setTags([]);
      setExecutionCost("");
      setMaterialsCost("");
      setCustomizeCost("");
      setTimeline("");
      setFiles([]);
      setExistingImages([]);
      setMaterials([]);
    }
  }, [editingDesign]);

  const totalCost = (parseInt(executionCost)||0) + (parseInt(materialsCost)||0) + (parseInt(customizeCost)||0);

  const handleAddFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        toast({ variant: "destructive", title: "Max 5 Images" });
        return;
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const addMaterialRow = () => {
    setMaterials([
      ...materials, 
      { id: Date.now(), material_name: "", quantity: "", unit: "nos", estimated_cost: "", category: "", notes: "" }
    ]);
  };

  const updateMaterial = (id: number, field: string, value: string) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMaterial = (id: number) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleSubmit = async (isPublished: boolean) => {
    if (!name || !category || !style || !description || !executionCost || !materialsCost) {
       toast({ variant: "destructive", title: "Submission Blocked", description: "All required creative fields must be populated." });
       return;
    }

    setIsUploading(true);
    try {
      // Step 1: Check if designer profile exists
      console.log("[PUBLISH DEBUG] Step 1: Checking designer profile for userId:", userId);
      const { data: designerCheck, error: designerCheckError } = await supabase
        .from('designers')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (designerCheckError) {
        console.error("[PUBLISH DEBUG] Step 1 FAILED - designers SELECT error:", designerCheckError);
        throw new Error("Designer profile not found. Please complete your 'Identity' setup before publishing.");
      }
      if (!designerCheck) {
        console.error("[PUBLISH DEBUG] Step 1 FAILED - No designer row found for userId:", userId);
        throw new Error("Designer profile not found. Please complete your 'Identity' setup before publishing.");
      }
      console.log("[PUBLISH DEBUG] Step 1 PASSED - Designer found:", designerCheck);

      // Step 2: Upload images
      console.log("[PUBLISH DEBUG] Step 2: Uploading", files.length, "images...");
      const uploadedImageUrls: string[] = [...existingImages];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `designs/${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('design-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error("[PUBLISH DEBUG] Step 2 FAILED - Storage upload error:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('design-images')
          .getPublicUrl(filePath);
        
        uploadedImageUrls.push(publicUrl);
      }
      console.log("[PUBLISH DEBUG] Step 2 PASSED - Images uploaded:", uploadedImageUrls.length);

      const designPayload = {
        designer_id: userId,
        name,
        category,
        style,
        room_size: roomSize || null,
        description,
        features,
        tags,
        execution_cost: parseInt(executionCost),
        materials_cost: parseInt(materialsCost),
        customize_cost: parseInt(customizeCost) || 0,
        total_cost: totalCost,
        timeline: timeline || null,
        images: uploadedImageUrls,
        is_published: isPublished
      };

      let designId = editingDesign?.id;

      if (editingDesign) {
        // Step 3a: Update existing design
        console.log("[PUBLISH DEBUG] Step 3a: Updating design:", editingDesign.id);
        const { error: updateError } = await supabase
          .from('designs')
          .update(designPayload)
          .eq('id', editingDesign.id);
        if (updateError) {
          console.error("[PUBLISH DEBUG] Step 3a FAILED - designs UPDATE error:", updateError);
          throw updateError;
        }
        console.log("[PUBLISH DEBUG] Step 3a PASSED - Design updated");
      } else {
        // Step 3b: Insert new design
        console.log("[PUBLISH DEBUG] Step 3b: Inserting new design with payload:", JSON.stringify(designPayload, null, 2));
        const { data: designData, error: designError } = await supabase
          .from('designs')
          .insert(designPayload)
          .select()
          .single();
        
        if (designError) {
          console.error("[PUBLISH DEBUG] Step 3b FAILED - designs INSERT error:", JSON.stringify(designError));
          console.error("[PUBLISH DEBUG] Error code:", designError.code, "| Message:", designError.message, "| Details:", designError.details, "| Hint:", designError.hint);
          throw new Error(`designs INSERT failed: ${designError.message} (code: ${designError.code})`);
        }
        
        if (!designData) {
          console.error("[PUBLISH DEBUG] Step 3b FAILED - No data returned from insert");
          throw new Error("Sync Failed: Record was not created.");
        }
        designId = designData.id;
        console.log("[PUBLISH DEBUG] Step 3b PASSED - Design created with id:", designId);
      }

      // Step 4: Handle materials
      if (designId && materials.length > 0) {
        console.log("[PUBLISH DEBUG] Step 4a: Deleting old materials for design:", designId);
        const { error: deleteMatError } = await supabase.from('design_materials').delete().eq('design_id', designId);
        if (deleteMatError) {
          console.error("[PUBLISH DEBUG] Step 4a FAILED - design_materials DELETE error:", deleteMatError);
          throw new Error(`design_materials DELETE failed: ${deleteMatError.message}`);
        }
        console.log("[PUBLISH DEBUG] Step 4a PASSED - Old materials deleted");
        
        const materialRows = materials.map(m => ({
          design_id: designId,
          material_name: m.material_name,
          quantity: parseFloat(m.quantity) || 0,
          unit: m.unit,
          estimated_cost: m.estimated_cost ? parseInt(m.estimated_cost) : null,
          category: m.category || null,
          notes: m.notes || null
        })).filter(m => m.material_name && m.quantity > 0);

        if (materialRows.length > 0) {
          console.log("[PUBLISH DEBUG] Step 4b: Inserting", materialRows.length, "materials:", JSON.stringify(materialRows));
          const { error: matError } = await supabase.from('design_materials').insert(materialRows);
          if (matError) {
            console.error("[PUBLISH DEBUG] Step 4b FAILED - design_materials INSERT error:", matError);
            throw new Error(`design_materials INSERT failed: ${matError.message}`);
          }
          console.log("[PUBLISH DEBUG] Step 4b PASSED - Materials inserted");
        }
      }

      // Step 5: Update designer total
      if (!editingDesign) {
        console.log("[PUBLISH DEBUG] Step 5: Updating designer total_designs");
        const { data: designerData, error: designerReadErr } = await supabase.from('designers').select('total_designs').eq('id', userId).single();
        if (designerReadErr) {
          console.error("[PUBLISH DEBUG] Step 5 read FAILED:", designerReadErr);
        }
        const currentTotal = designerData?.total_designs || 0;
        const { error: designerUpdateErr } = await supabase.from('designers').update({ total_designs: currentTotal + 1 }).eq('id', userId);
        if (designerUpdateErr) {
          console.error("[PUBLISH DEBUG] Step 5 update FAILED - designers UPDATE error:", designerUpdateErr);
          // Don't throw here, design was already created successfully
        }
        console.log("[PUBLISH DEBUG] Step 5 PASSED - Designer total updated");
        toast({ title: isPublished ? "Published to Marketplace! 🚀" : "Archived in Drafts." });
      } else {
        toast({ title: "Design Updated! ✨" });
      }
      
      console.log("[PUBLISH DEBUG] ✅ ALL STEPS COMPLETED SUCCESSFULLY");
      onSuccess();
    } catch (error: any) {
      console.error("[PUBLISH DEBUG] ❌ FINAL ERROR:", error);
      toast({ variant: "destructive", title: "Publish Error", description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-end">
         {editingDesign && (
           <Button variant="ghost" onClick={() => onSuccess()} className="font-bold text-muted-foreground hover:text-foreground">
             <X className="w-4 h-4 mr-2" /> Cancel Editing
           </Button>
         )}
      </div>

      <Reveal width="100%" direction="up">
        <Card className="border-border/50 shadow-2xl bg-background rounded-[3.5rem] overflow-hidden group">
          <div className="bg-primary/5 px-12 py-10 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/20">
                <CloudUpload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-foreground">{editingDesign ? "Update Studio Masterpiece" : "Creative Brief"}</h3>
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">{editingDesign ? "Refining Architectural Vision" : "Foundational Details"}</p>
              </div>
            </div>
            <Zap className="w-10 h-10 text-primary opacity-20" />
          </div>
          <CardContent className="p-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Creation Name *</Label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="E.g. Penthouse Azure Kitchen" className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Architectural Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-transparent font-bold"><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c} className="rounded-xl">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Aesthetic Style *</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-transparent font-bold"><SelectValue placeholder="Select Style" /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {STYLES.map(s => <SelectItem key={s} value={s} className="rounded-xl">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Deployment Area (Room Size)</Label>
                <Input value={roomSize} onChange={e => setRoomSize(e.target.value)} placeholder="12 x 15 ft" className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Narrative Description *</Label>
                <Textarea 
                  required 
                  maxLength={1000} 
                  rows={5} 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="The artistic vision and technical nuance behind this masterpiece..."
                  className="rounded-[2.5rem] bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold p-8"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-border/30 pt-10">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">High-Impact Features</Label>
                <div className="flex gap-4">
                  <Input 
                    value={featureInput} 
                    onChange={e => setFeatureInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="E.g. Soft-close Veneer"
                    className="h-14 rounded-2l bg-secondary/30 border-transparent font-bold"
                  />
                  <Button type="button" onClick={handleAddFeature} className="h-14 w-20 rounded-2xl">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <AnimatePresence>
                    {features.map((f, i) => (
                      <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                        <Badge variant="secondary" className="pl-4 pr-2 py-2 rounded-full border-primary/10 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          {f}
                          <motion.button whileHover={{ scale: 1.2 }} onClick={() => setFeatures(features.filter(_f => _f !== f))} className="bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></motion.button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Discovery Tags</Label>
                <div className="flex gap-4">
                  <Input 
                    value={tagInput} 
                    onChange={e => setTagInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="E.g. luxury, nordic"
                    className="h-14 rounded-2xl bg-secondary/30 border-transparent font-bold"
                  />
                  <Button type="button" onClick={handleAddTag} className="h-14 w-20 rounded-2xl">Tag</Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <AnimatePresence>
                    {tags.map((t, i) => (
                      <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                        <Badge variant="outline" className="pl-4 pr-2 py-2 rounded-full border-border bg-background text-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          #{t}
                          <motion.button whileHover={{ scale: 1.2 }} onClick={() => setTags(tags.filter(_t => _t !== t))} className="bg-secondary p-0.5 rounded-full"><X className="w-3 h-3" /></motion.button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal width="100%" direction="up" delay={0.1}>
        <Card className="border-border/50 shadow-2xl bg-background rounded-[3.5rem] overflow-hidden">
          <div className="bg-secondary/30 px-12 py-10 border-b border-border/50 flex items-center gap-5">
             <div className="w-16 h-16 bg-background rounded-[1.5rem] flex items-center justify-center shadow-sm">
                <FileImage className="w-8 h-8 text-primary" />
             </div>
             <div>
                <h3 className="text-2xl font-black tracking-tight text-foreground">Economic Suite & Imagery</h3>
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Value Proposition</p>
             </div>
          </div>
          <CardContent className="p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="p-8 rounded-[2.5rem] bg-secondary/20 border border-border/50 group hover:border-primary/30 transition-all">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">Execution Cost (₹) *</Label>
                <Input type="number" required value={executionCost} onChange={e => setExecutionCost(e.target.value)} className="h-14 rounded-2xl bg-background border-transparent font-black text-xl" />
              </div>
              <div className="p-8 rounded-[2.5rem] bg-secondary/20 border border-border/50 group hover:border-primary/30 transition-all">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">Materials Cost (₹) *</Label>
                <Input type="number" required value={materialsCost} onChange={e => setMaterialsCost(e.target.value)} className="h-14 rounded-2xl bg-background border-transparent font-black text-xl" />
              </div>
              <div className="p-8 rounded-[2.5rem] bg-secondary/20 border border-border/50 group hover:border-primary/30 transition-all">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">Finesse Cost (₹)</Label>
                <Input type="number" value={customizeCost} onChange={e => setCustomizeCost(e.target.value)} placeholder="0" className="h-14 rounded-2xl bg-background border-transparent font-black text-xl" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between p-10 rounded-[3rem] bg-primary/5 border border-primary/20">
               <div>
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">Total Project Valuation</p>
                 <div className="text-5xl font-black tracking-tighter text-foreground">₹{totalCost.toLocaleString()}</div>
               </div>
               <div className="space-y-3 w-full md:w-1/3 mt-8 md:mt-0">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Standard Delivery Timeline</Label>
                  <Input value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. 25-30 days" className="h-14 rounded-2xl bg-background border-transparent font-bold" />
               </div>
            </div>

            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Studio Gallery (Max 5 Renderings)</Label>
                <Badge className="bg-secondary text-foreground text-[9px] font-black uppercase px-4">{files.length} / 5 Selected</Badge>
              </div>
              <div className="relative group">
                <div className="border-4 border-dashed border-border/50 rounded-[3rem] bg-secondary/10 group-hover:bg-primary/5 group-hover:border-primary/30 transition-all flex flex-col items-center justify-center p-16 text-center space-y-6">
                   <div className="w-20 h-20 bg-background rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/5 group-hover:scale-110 transition-transform duration-500">
                      <UploadCloud className="w-10 h-10 text-primary" />
                   </div>
                   <div className="space-y-2">
                     <p className="font-black text-foreground uppercase text-sm tracking-widest">Drop Masterpieces Here</p>
                     <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">PNG, JPG, WEBP (Max 5MB each)</p>
                   </div>
                   <Button type="button" variant="outline" className="rounded-2xl px-10 h-12 font-black uppercase tracking-widest text-[10px] bg-background border-2 hover:bg-primary hover:text-white transition-all pointer-events-none">
                     Select Masterpieces
                   </Button>
                </div>
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange} 
                  disabled={files.length >= 5} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full w-full" 
                  title=""
                  value=""
                />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                <AnimatePresence>
                  {/* Existing Images */}
                  {existingImages.map((url, i) => (
                    <motion.div key={`existing-${i}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative aspect-square rounded-[1.5rem] border-2 border-primary/20 shadow-xl overflow-hidden group/img">
                      <img src={url} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" alt="existing" />
                      <button 
                        type="button"
                        className="absolute top-2 right-2 bg-destructive text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 opacity-0 group-hover/img:opacity-100"
                        onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                  {/* New Files */}
                  {files.map((file, i) => (
                    <motion.div key={`new-${i}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative aspect-square rounded-[1.5rem] border-2 border-border shadow-xl overflow-hidden group/img">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" alt="preview" />
                      <button 
                        type="button"
                        className="absolute top-2 right-2 bg-destructive text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 opacity-0 group-hover/img:opacity-100"
                        onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal width="100%" direction="up" delay={0.2}>
        <Card className="border-border/50 shadow-2xl bg-background rounded-[3.5rem] overflow-hidden">
          <CardHeader className="px-12 py-10 border-b border-border/50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 bg-secondary/50 rounded-[1.5rem] flex items-center justify-center shadow-sm">
                  <ListTodo className="w-8 h-8 text-primary" />
               </div>
               <div>
                  <h3 className="text-2xl font-black tracking-tight text-foreground">Bill of Materials</h3>
                  <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Technical Specification</p>
               </div>
            </div>
            <Button variant="outline" className="rounded-2xl h-14 px-8 border-2 font-black transition-all hover:bg-primary hover:text-white hover:border-primary" onClick={addMaterialRow}>
              <Plus className="w-5 h-5 mr-3" /> Append Material
            </Button>
          </CardHeader>
          <CardContent className="p-12">
            {!materials || materials.length === 0 ? (
              <div className="text-center py-24 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border/50 group">
                <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-6 group-hover:rotate-12 transition-transform" />
                <p className="text-muted-foreground/60 font-black text-sm uppercase tracking-widest">Detail the exact components required to execute this vision.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {materials.map((mat, index) => (
                    <motion.div 
                      key={mat.id} 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="grid grid-cols-12 gap-6 items-end p-8 rounded-[2rem] bg-secondary/20 border border-border/30 hover:border-primary/20 hover:bg-background transition-all group"
                    >
                      <div className="col-span-12 lg:col-span-4 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Component Name *</Label>
                        <Input value={mat.material_name} onChange={e => updateMaterial(mat.id, 'material_name', e.target.value)} className="h-12 bg-background/50 border-transparent rounded-xl font-bold" />
                      </div>
                      <div className="col-span-6 lg:col-span-2 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Unit Count *</Label>
                        <Input type="number" value={mat.quantity} onChange={e => updateMaterial(mat.id, 'quantity', e.target.value)} className="h-12 bg-background/50 border-transparent rounded-xl font-bold" />
                      </div>
                      <div className="col-span-6 lg:col-span-2 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Metric</Label>
                        <Select value={mat.unit} onValueChange={val => updateMaterial(mat.id, 'unit', val)}>
                          <SelectTrigger className="h-12 bg-background/50 border-transparent rounded-xl font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">{UNITS.map(u => <SelectItem key={u} value={u} className="rounded-lg">{u}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-10 lg:col-span-3 space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Market Notes</Label>
                         <Input value={mat.notes} onChange={e => updateMaterial(mat.id, 'notes', e.target.value)} placeholder="Grade, Finish, Brand..." className="h-12 bg-background/50 border-transparent rounded-xl font-bold" />
                      </div>
                      <div className="col-span-2 lg:col-span-1 flex justify-end">
                        <motion.button 
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          onClick={() => removeMaterial(mat.id)}
                          className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center transition-all shadow-sm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-6 p-12 bg-secondary/30 border-t border-border/50">
            <Button variant="outline" className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-xs border-2 shadow-sm" onClick={() => handleSubmit(false)} disabled={isUploading}>
              {isUploading ? "..." : "Archive as Draft"}
            </Button>
            <Button size="lg" className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 group relative overflow-hidden" onClick={() => handleSubmit(true)} disabled={isUploading}>
              <span className="relative z-10 flex items-center gap-3">
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    Publish Architecture
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
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
          </CardFooter>
        </Card>
      </Reveal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SECTION: Designer Profile
// ---------------------------------------------------------------------------
function DesignerProfileSection({ userId }: { userId: string }) {
  const { toast } = useToast();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['designer-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('designers').select('*').eq('id', userId).single();
      if (error) throw error;
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase.from('designers').update(updates).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => toast({ title: "Profile Synchronized! ✨" })
  });
  
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  if (isLoading || !formData.id) return <div className="flex justify-center p-20 animate-pulse font-bold tracking-widest text-[10px] uppercase">Retrieving Identity...</div>;

  const handleSpecializationToggle = (spec: string) => {
    const current = formData.specializations || [];
    if (current.includes(spec)) {
      setFormData({ ...formData, specializations: current.filter((s: string) => s !== spec) });
    } else {
      setFormData({ ...formData, specializations: [...current, spec] });
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border-border/50 shadow-2xl bg-background rounded-[4rem] overflow-hidden">
      <div className="bg-primary/5 px-12 py-10 border-b border-border/50 flex items-center justify-between">
         <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-background rounded-[1.5rem] flex items-center justify-center shadow-sm">
               <User className="w-8 h-8 text-primary" />
            </div>
            <div>
               <h3 className="text-2xl font-black tracking-tight text-foreground">Global Identity</h3>
               <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Profile Configuration</p>
            </div>
         </div>
         <Star className="w-10 h-10 text-yellow-500/20" />
      </div>
      <CardContent className="p-12 space-y-12">
        <form onSubmit={e => { e.preventDefault(); updateMutation.mutate(formData); }} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Creative Handle</Label>
              <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black text-lg" />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Direct Line</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black text-lg" />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Headquarters (City)</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="pl-12 h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black text-lg" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Design Tenure (Years)</Label>
              <Input type="number" value={formData.years_experience} onChange={e => setFormData({...formData, years_experience: parseInt(e.target.value)})} className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black text-lg" />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Studio Portfolio (Link)</Label>
              <Input value={formData.portfolio_website || ""} onChange={e => setFormData({...formData, portfolio_website: e.target.value})} className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Instagram Identity</Label>
              <Input value={formData.instagram_url || ""} onChange={e => setFormData({...formData, instagram_url: e.target.value})} className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
            </div>
          </div>
          
          <div className="space-y-6 pt-6 border-t border-border/30">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Areas of Expertise</Label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {SPECIALIZATIONS.map(spec => (
                <motion.div key={spec} whileHover={{ x: 5 }} className="flex items-center space-x-4 p-4 rounded-2xl bg-secondary/20 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => handleSpecializationToggle(spec)}>
                  <Checkbox 
                    id={`prof-spec-${spec}`} 
                    checked={(formData.specializations || []).includes(spec)}
                    onCheckedChange={() => handleSpecializationToggle(spec)}
                    className="scale-125 rounded-lg border-2"
                  />
                  <Label htmlFor={`prof-spec-${spec}`} className="font-bold text-sm text-foreground cursor-pointer tracking-tight">{spec}</Label>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-border/30">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Narrative</Label>
            <Textarea rows={6} value={formData.bio || ""} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Your architectural philosophy and mission..." className="rounded-[2.5rem] bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold p-8" />
          </div>

          <div className="flex justify-end pt-10">
            <Button size="lg" disabled={updateMutation.isPending} className="h-16 px-12 rounded-2xl font-black shadow-xl shadow-primary/20 group relative overflow-hidden">
               <span className="relative z-10 flex items-center gap-3">
                 {updateMutation.isPending ? (
                   <>
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                   </>
                 ) : (
                   <>
                    Save Identity Changes
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// SECTION: Reviews
// ---------------------------------------------------------------------------
function DesignerReviewsSection({ userId }: { userId: string }) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['designer-reviews', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('design_reviews')
        .select('*, designs(name)')
        .eq('designs.designer_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) return <div className="flex justify-center p-20 animate-pulse font-bold tracking-widest text-[10px] uppercase">Retrieving Critiques...</div>;

  return (
    <Card className="max-w-4xl mx-auto border-border/50 shadow-2xl bg-background rounded-[4rem] overflow-hidden">
      <div className="bg-primary/5 px-12 py-10 border-b border-border/50 flex items-center gap-5">
         <div className="w-16 h-16 bg-background rounded-[1.5rem] flex items-center justify-center shadow-sm">
            <MessageSquare className="w-8 h-8 text-primary" />
         </div>
         <div>
            <h3 className="text-2xl font-black tracking-tight text-foreground">Marketplace Critique</h3>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Reputation Engine</p>
         </div>
      </div>
      <CardContent className="p-12">
        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-24 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border/50">
             <Star className="w-12 h-12 text-muted-foreground/10 mx-auto mb-6" />
             <p className="text-muted-foreground/60 font-black text-sm uppercase tracking-widest">No marketplace feedback has been recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
             {reviews.filter(r => r.designs).map((review, idx) => (
                <motion.div 
                   key={review.id} 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   className="p-10 border border-border/50 rounded-[3rem] bg-secondary/10 hover:bg-background hover:shadow-xl transition-all group"
                >
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Creation Subject</p>
                        <h4 className="font-black text-xl text-foreground tracking-tight">{review.designs?.name}</h4>
                      </div>
                      <Badge className="bg-background text-foreground border shadow-sm px-4 py-2 rounded-full font-black uppercase text-[10px] tracking-widest">
                        {new Date(review.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Badge>
                   </div>
                   <div className="flex gap-1 mb-8">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-6 h-6 ${i < (review.rating || 0) ? "text-yellow-500 fill-current" : "text-muted-foreground/20"}`} />
                      ))}
                   </div>
                   <p className="text-xl font-bold italic text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors">"{review.review}"</p>
                </motion.div>
             ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
