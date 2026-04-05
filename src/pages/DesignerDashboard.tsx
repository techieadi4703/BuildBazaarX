import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, UploadCloud, FileImage, Trash2, Edit2, CheckCircle, Mail, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/designer/auth");
        return;
      }
      setUser(session.user);
    };
    init();
  }, [navigate]);

  if (!user) {
    return <Layout><div className="flex justify-center p-12">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Designer Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-2 p-1">
            <TabsTrigger value="designs">My Designs</TabsTrigger>
            <TabsTrigger value="upload">Upload Design</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="designs">
            <MyDesignsSection userId={user.id} onGoToUpload={() => setActiveTab("upload")} />
          </TabsContent>

          <TabsContent value="upload">
            <UploadDesignSection userId={user.id} onSuccess={() => setActiveTab("designs")} />
          </TabsContent>

          <TabsContent value="profile">
            <DesignerProfileSection userId={user.id} />
          </TabsContent>

          <TabsContent value="reviews">
            <DesignerReviewsSection userId={user.id} />
          </TabsContent>

          <TabsContent value="account">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 border p-4 rounded-md">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button variant="destructive" className="w-full" onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/designer/auth");
                }}>
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

// ---------------------------------------------------------------------------
// SECTION: My Designs
// ---------------------------------------------------------------------------
function MyDesignsSection({ userId, onGoToUpload }: { userId: string, onGoToUpload: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      toast({ title: "Status updated" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Update failed", description: err.message });
    }
  });

  if (isLoading) return <div>Loading designs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Designs</h2>
        <Button onClick={onGoToUpload}><Plus className="w-4 h-4 mr-2"/> Upload New Design</Button>
      </div>

      {!designs || designs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <FileImage className="w-12 h-12 mb-4 opacity-50" />
          <p className="mb-4">You haven't uploaded any designs yet.</p>
          <Button onClick={onGoToUpload} variant="outline">Create Your First Design</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map(design => (
            <Card key={design.id} className="overflow-hidden group">
              <div className="relative aspect-video bg-muted border-b">
                {design.images && design.images.length > 0 ? (
                  <img src={design.images[0]} alt={design.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">No Image</div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={design.is_published ? "default" : "secondary"}>
                    {design.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-1">{design.name}</CardTitle>
                <CardDescription>{design.category}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-semibold">₹{design.total_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Views</span>
                  <span>{design.view_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <span>{design.rating || 0} ⭐ ({design.total_reviews || 0})</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 gap-2">
                <Button variant="outline" className="flex-1" size="sm" onClick={() => {
                  togglePublishMutation.mutate({ designId: design.id, isPublished: !design.is_published });
                }}>
                  {design.is_published ? "Unpublish" : "Publish"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4"/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled><Edit2 className="w-4 h-4 mr-2"/> Edit (Coming Soon)</DropdownMenuItem>
                    {/* Add delete when ready */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SECTION: Upload Design
// ---------------------------------------------------------------------------
function UploadDesignSection({ userId, onSuccess }: { userId: string, onSuccess: () => void }) {
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
  
  // Materials list
  const [materials, setMaterials] = useState<any[]>([]);

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
        toast({ variant: "destructive", title: "Max 5 images allowed" });
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
       toast({ variant: "destructive", title: "Missing fields", description: "Please fill all required primary details." });
       return;
    }

    setIsUploading(true);
    try {
      // 1. Upload Images
      const uploadedImageUrls: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `designs/${userId}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('design-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('design-images')
          .getPublicUrl(filePath);
        
        uploadedImageUrls.push(publicUrl);
      }

      // 2. Insert Design
      const { data: designData, error: designError } = await supabase
        .from('designs')
        .insert({
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
        })
        .select()
        .single();

      if (designError || !designData) throw designError || new Error("Failed to create design");

      // 3. Insert Materials
      if (materials.length > 0) {
        const materialRows = materials.map(m => ({
          design_id: designData.id,
          material_name: m.material_name,
          quantity: parseFloat(m.quantity) || 0,
          unit: m.unit,
          estimated_cost: m.estimated_cost ? parseInt(m.estimated_cost) : null,
          category: m.category || null,
          notes: m.notes || null
        })).filter(m => m.material_name && m.quantity > 0);

        if (materialRows.length > 0) {
          const { error: matError } = await supabase.from('design_materials').insert(materialRows);
          if (matError) throw matError;
        }
      }

      // 4. Update total_designs on designer
      const { data: designerData } = await supabase.from('designers').select('total_designs').eq('id', userId).single();
      const currentTotal = designerData?.total_designs || 0;
      await supabase.from('designers').update({ total_designs: currentTotal + 1 }).eq('id', userId);

      toast({ title: isPublished ? "Design published successfully!" : "Design saved as draft." });
      
      // Reset form
      setName(""); setCategory(""); setStyle(""); setRoomSize(""); setDescription("");
      setFeatures([]); setTags([]); setExecutionCost(""); setMaterialsCost(""); setCustomizeCost("");
      setTimeline(""); setFiles([]); setMaterials([]);
      
      queryClient.invalidateQueries({ queryKey: ['designer-designs', userId] });
      onSuccess();

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error uploading", description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Design Details</CardTitle>
          <CardDescription>Basic information about your design.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Design Name *</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Style *</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue placeholder="Select Style" /></SelectTrigger>
                <SelectContent>
                  {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room Size (e.g. 10x12 ft)</Label>
              <Input value={roomSize} onChange={e => setRoomSize(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description *</Label>
              <Textarea 
                required 
                maxLength={1000} 
                rows={4} 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input 
                  value={featureInput} 
                  onChange={e => setFeatureInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <Button type="button" onClick={handleAddFeature}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="pl-2 pr-1 py-1">
                    {f}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFeatures(features.filter(_f => _f !== f))}/>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input 
                  value={tagInput} 
                  onChange={e => setTagInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t, i) => (
                  <Badge key={i} variant="outline" className="pl-2 pr-1 py-1">
                    #{t}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setTags(tags.filter(_t => _t !== t))}/>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Execution Cost (₹) *</Label>
              <Input type="number" required value={executionCost} onChange={e => setExecutionCost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Materials Cost (₹) *</Label>
              <Input type="number" required value={materialsCost} onChange={e => setMaterialsCost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Customization Cost (₹)</Label>
              <Input type="number" value={customizeCost} onChange={e => setCustomizeCost(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2 md:col-span-3 border-t pt-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Calculated Total Cost:</span>
                <span className="font-bold text-primary">₹{totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 w-full md:w-1/3">
            <Label>Estimated Timeline</Label>
            <Input value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. 25-30 days" />
          </div>

          <div className="space-y-2">
            <Label>Gallery Images (Max 5)</Label>
            <Input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={files.length >= 5} />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((file, i) => (
                  <div key={i} className="relative w-20 h-20 border rounded overflow-hidden">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                    <button 
                      type="button"
                      className="absolute top-0 right-0 bg-destructive text-destructive-foreground w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>Raw Materials List</CardTitle>
            <CardDescription>Optional: List the materials required for this design.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addMaterialRow}>
            <Plus className="w-4 h-4 mr-2" /> Add Material
          </Button>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No materials added.</p>
          ) : (
            <div className="space-y-4">
              {materials.map((mat, index) => (
                <div key={mat.id} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md bg-muted/20">
                  <div className="col-span-12 md:col-span-3 space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input size={1} value={mat.material_name} onChange={e => updateMaterial(mat.id, 'material_name', e.target.value)} />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-1">
                    <Label className="text-xs">Qty *</Label>
                    <Input type="number" value={mat.quantity} onChange={e => updateMaterial(mat.id, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <Select value={mat.unit} onValueChange={val => updateMaterial(mat.id, 'unit', val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-12 md:col-span-2 space-y-1">
                    <Label className="text-xs">Est. Cost (₹)</Label>
                    <Input type="number" value={mat.estimated_cost} onChange={e => updateMaterial(mat.id, 'estimated_cost', e.target.value)} />
                  </div>
                  <div className="col-span-10 md:col-span-2 space-y-1">
                    <Label className="text-xs">Notes</Label>
                    <Input value={mat.notes} onChange={e => updateMaterial(mat.id, 'notes', e.target.value)} />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => removeMaterial(mat.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t pt-4 bg-muted/10">
          <Button variant="outline" onClick={() => handleSubmit(false)} disabled={isUploading}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={isUploading}>
            {isUploading ? "Publishing..." : "Publish Design"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SECTION: My Profile
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
    onSuccess: () => toast({ title: "Profile updated" })
  });
  
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  if (isLoading || !formData.id) return <div>Loading profile...</div>;

  const handleSpecializationToggle = (spec: string) => {
    const current = formData.specializations || [];
    if (current.includes(spec)) {
      setFormData({ ...formData, specializations: current.filter((s: string) => s !== spec) });
    } else {
      setFormData({ ...formData, specializations: [...current, spec] });
    }
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your public designer profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={e => { e.preventDefault(); updateMutation.mutate(formData); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input type="number" value={formData.years_experience} onChange={e => setFormData({...formData, years_experience: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Portfolio Website</Label>
              <Input value={formData.portfolio_website || ""} onChange={e => setFormData({...formData, portfolio_website: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input value={formData.instagram_url || ""} onChange={e => setFormData({...formData, instagram_url: e.target.value})} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Specializations</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {SPECIALIZATIONS.map(spec => (
                <div key={spec} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`prof-spec-${spec}`} 
                    checked={(formData.specializations || []).includes(spec)}
                    onCheckedChange={() => handleSpecializationToggle(spec)}
                  />
                  <Label htmlFor={`prof-spec-${spec}`} className="font-normal text-sm">{spec}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea rows={4} value={formData.bio || ""} onChange={e => setFormData({...formData, bio: e.target.value})} />
          </div>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
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

  if (isLoading) return <div>Loading reviews...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Design Reviews</CardTitle>
        <CardDescription>Feedback on your uploaded designs.</CardDescription>
      </CardHeader>
      <CardContent>
        {!reviews || reviews.length === 0 ? (
          <p className="text-muted-foreground py-4">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
             {/* Note: This is an inner join scenario depending on PostgREST, but assuming it works or we filter if null */}
             {reviews.filter(r => r.designs).map(review => (
                <div key={review.id} className="border p-4 rounded-md">
                   <div className="flex justify-between mb-2">
                      <span className="font-semibold text-sm">Design: {review.designs?.name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                   </div>
                   <div className="flex mb-2">
                      {"⭐".repeat(review.rating || 0)}
                   </div>
                   <p className="italic text-sm text-foreground">"{review.review}"</p>
                </div>
             ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
