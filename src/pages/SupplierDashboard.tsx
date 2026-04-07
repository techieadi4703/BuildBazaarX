import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Upload, PackageOpen, LayoutGrid, UserCircle, Settings, Store, Search, LogOut, CheckCircle2, Package, Pencil, Trash, Sparkles, Zap, ArrowRight, Mail, Phone, MapPin, ClipboardList, TrendingUp, ShieldCheck, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = [
  { id: "wood", label: "Wood & Boards" },
  { id: "construction", label: "Construction Materials" },
  { id: "paints", label: "Paints & Finishes" },
  { id: "plumbing", label: "Plumbing & Sanitary" },
  { id: "electrical", label: "Electrical & Lighting" },
  { id: "tiles", label: "Tiles & Flooring" },
  { id: "hardware", label: "Hardware & Accessories" },
];

const UNITS = ["piece", "sq.ft", "kg", "ltr", "bag", "bundle", "rmt", "sheet"];

export default function SupplierDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [supplierData, setSupplierData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("products");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  const [productForm, setProductForm] = useState({
    name: "", brand: "", category: "", sub_category: "", specs: "", description: "",
    price: "", original_price: "", discount: "", bulk_price: "", bulk_min_qty: "",
    unit: "piece", min_order_qty: "1", stock_qty: "0", delivery_info: "Free Delivery", 
    delivery_days: "5", tags: ""
  });
  const [productImages, setProductImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    business_name: "", owner_name: "", phone: "", city: "", address: "", 
    pincode: "", gst_number: "", business_type: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (productForm.price && productForm.original_price) {
      const price = parseFloat(productForm.price);
      const original = parseFloat(productForm.original_price);
      if (original > price && original > 0) {
        const disc = Math.round(((original - price) / original) * 100);
        setProductForm(prev => ({ ...prev, discount: disc.toString() }));
      }
    }
  }, [productForm.price, productForm.original_price]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/supplier/auth");
        return;
      }
      setUser(session.user);

      const { data: supplier, error: supplierErr } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (supplierErr) throw supplierErr;
      if (!supplier) {
        navigate("/supplier/setup");
        return;
      }
      setSupplierData(supplier);
      setProfileForm({
        business_name: supplier.business_name || "",
        owner_name: supplier.owner_name || "",
        phone: supplier.phone || "",
        city: supplier.city || "",
        address: supplier.address || "",
        pincode: supplier.pincode || "",
        gst_number: supplier.gst_number || "",
        business_type: supplier.business_type || ""
      });

      const { data: prods } = await supabase
        .from("supplier_products")
        .select("*")
        .eq("supplier_id", session.user.id)
        .order("created_at", { ascending: false });
      setProducts(prods || []);

      const { data: inqs } = await supabase
        .from("bulk_inquiries")
        .select("*, supplier_products(name)")
        .eq("supplier_id", session.user.id)
        .order("created_at", { ascending: false });
      setInquiries(inqs || []);

    } catch (err: any) {
      console.error(err);
      toast({ title: "Sync Failed", description: "Could not synchronize with store vault.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateInquiryStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase
        .from("bulk_inquiries")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Inquiry Updated", description: `Status changed to ${status}.` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const { error: supplierError } = await supabase
        .from("suppliers")
        .update({
          business_name: profileForm.business_name,
          owner_name: profileForm.owner_name,
          phone: profileForm.phone,
          city: profileForm.city,
          address: profileForm.address,
          pincode: profileForm.pincode,
          gst_number: profileForm.gst_number,
          business_type: profileForm.business_type
        })
        .eq("id", user.id);
      if (supplierError) throw supplierError;

      // Sync with profiles table
      if (profileForm.owner_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: profileForm.owner_name })
          .eq('id', user.id);
        if (profileError) throw profileError;
      }
      toast({ title: "Profile Synchronized! ✨", description: "Your business identity has been updated." });
      fetchData();
    } catch (err: any) {
      toast({ title: "Sync Error", description: err.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/supplier/auth");
  };

  const submitProduct = async (isPublished: boolean) => {
    if (!user) return;
    try {
      setIsUploading(true);
      const imageUrls: string[] = [...existingImages];

      for (const file of productImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }

      const tagsArray = productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(t => t) : [];

      const productPayload = {
        supplier_id: user.id,
        name: productForm.name,
        brand: productForm.brand,
        category: productForm.category,
        sub_category: productForm.sub_category,
        specs: productForm.specs,
        description: productForm.description,
        price: parseInt(productForm.price) || 0,
        original_price: parseInt(productForm.original_price) || null,
        discount: parseInt(productForm.discount) || 0,
        bulk_price: parseInt(productForm.bulk_price) || null,
        bulk_min_qty: parseInt(productForm.bulk_min_qty) || null,
        unit: productForm.unit,
        min_order_qty: parseInt(productForm.min_order_qty) || 1,
        stock_qty: parseInt(productForm.stock_qty) || 0,
        delivery_info: productForm.delivery_info,
        delivery_days: parseInt(productForm.delivery_days) || 5,
        tags: tagsArray,
        images: imageUrls,
        is_published: isPublished
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("supplier_products")
          .update(productPayload)
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Inventory Synchronized! ✨" });
      } else {
        const { error } = await supabase.from("supplier_products").insert(productPayload);
        if (error) throw error;
        await supabase.from("suppliers").update({ total_products: (supplierData?.total_products || 0) + 1 }).eq("id", user.id);
        toast({ title: isPublished ? "Published to Marketplace! 🚀" : "Archived in Drafts." });
      }

      setIsAddProductOpen(false);
      resetProductForm();
      fetchData();
    } catch (err: any) {
      toast({ title: "Sync Error", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    await supabase.from("supplier_products").update({ is_published: !currentStatus }).eq("id", id);
    fetchData();
    toast({ title: "Visibility Updated" });
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("supplier_products").delete().eq("id", id);
    toast({ title: "Product Liquidated" });
    fetchData();
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      sub_category: product.sub_category || "",
      specs: product.specs || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      original_price: product.original_price?.toString() || "",
      discount: product.discount?.toString() || "0",
      bulk_price: product.bulk_price?.toString() || "",
      bulk_min_qty: product.bulk_min_qty?.toString() || "",
      unit: product.unit || "piece",
      min_order_qty: product.min_order_qty?.toString() || "1",
      stock_qty: product.stock_qty?.toString() || "0",
      delivery_info: product.delivery_info || "Free Delivery",
      delivery_days: product.delivery_days?.toString() || "5",
      tags: (product.tags || []).join(", ")
    });
    setExistingImages(product.images || []);
    setProductImages([]);
    setIsAddProductOpen(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: "", brand: "", category: "", sub_category: "", specs: "", description: "",
      price: "", original_price: "", discount: "", bulk_price: "", bulk_min_qty: "",
      unit: "piece", min_order_qty: "1", stock_qty: "0", delivery_info: "Free Delivery", 
      delivery_days: "5", tags: ""
    });
    setProductImages([]);
    setExistingImages([]);
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
          >
            <Store className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-xl font-black text-muted-foreground animate-pulse uppercase tracking-widest text-[10px]">Syncing Business Intelligence...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-secondary/10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          
          {/* Header Card */}
          <div className="mb-12">
            <Reveal width="100%" direction="up">
              <Card className="border-border/50 shadow-2xl bg-background rounded-[3rem] overflow-hidden">
                <div className="flex flex-col md:flex-row p-10 md:p-14 gap-10 items-start md:items-center justify-between">
                  <div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
                      Supplier <span className="text-primary tracking-tighter">Terminal</span>
                    </h1>
                    <div className="flex items-center gap-4">
                       <Badge className="bg-primary text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">
                        Authorized Supplier
                       </Badge>
                       <p className="text-muted-foreground font-bold flex items-center gap-2">
                        <Store className="w-5 h-5 text-primary" /> {supplierData?.business_name}
                        {supplierData?.is_verified && <CheckCircle2 className="w-5 h-5 text-green-500 fill-current" />}
                       </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {activeTab === "products" && !isAddProductOpen && (
                      <Button size="lg" className="rounded-2xl font-black shadow-lg shadow-primary/20 group" onClick={() => setIsAddProductOpen(true)}>
                        <PackageOpen className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        Stock New Unit
                      </Button>
                    )}
                    {isAddProductOpen && (
                      <Button variant="outline" size="lg" className="rounded-2xl font-black border-2" onClick={() => setIsAddProductOpen(false)}>
                        Return to Inventory
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Stats quick-view */}
                <div className="bg-secondary/30 grid grid-cols-2 md:grid-cols-4 border-t border-border/50">
                  {[
                    { label: "Active Stock", value: products.filter(p => p.is_published).length, icon: Package },
                    { label: "Pending Inquiries", value: inquiries.filter(i => i.status === 'pending').length, icon: ClipboardList, color: "text-destructive" },
                    { label: "Verified Performance", value: "A+", icon: TrendingUp },
                    { label: "Market Trust", value: "98%", icon: ShieldCheck },
                  ].map((stat, i) => (
                    <div key={i} className="p-8 border-r border-border/50 last:border-0 flex items-center gap-5">
                       <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center shadow-sm">
                          <stat.icon className={`w-6 h-6 ${stat.color || "text-primary"}`} />
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-xl font-black text-foreground">{stat.value}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-[280px_1fr] gap-12">
            {/* Sidebar Navigation */}
            <Reveal width="100%" direction="right">
              <nav className="space-y-3 sticky top-32">
                {[
                  { id: "products", label: "Inventory", icon: LayoutGrid },
                  { id: "inquiries", label: "Orders & Inquiries", icon: Package, badge: inquiries.filter(i => i.status === 'pending').length },
                  { id: "profile", label: "Business Identity", icon: Store },
                  { id: "account", label: "Control Center", icon: Settings },
                ].map((item) => (
                  <Button 
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"} 
                    className={`w-full h-16 justify-start px-8 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] transition-all relative overflow-hidden group ${activeTab === item.id ? "shadow-xl shadow-primary/20" : ""}`} 
                    onClick={() => {setActiveTab(item.id); setIsAddProductOpen(false);}}
                  >
                    <item.icon className="w-5 h-5 mr-4" />
                    {item.label}
                    {item.badge ? (
                      <span className="ml-auto bg-destructive text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                        {item.badge}
                      </span>
                    ) : null}
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute inset-0 bg-primary/10 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Button>
                ))}
                
                <Separator className="my-8" />
                
                <Button 
                  variant="ghost" 
                  className="w-full h-16 justify-start px-8 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] text-destructive hover:bg-destructive/10 transition-all" 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/supplier/auth");
                  }}
                >
                  <LogOut className="w-5 h-5 mr-4" />
                  Liquidate Session
                </Button>
              </nav>
            </Reveal>

            {/* Main Content Area */}
            <div className="min-h-[600px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + (isAddProductOpen ? '-add' : '')}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* PRODUCTS LIST */}
                  {activeTab === "products" && !isAddProductOpen && (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                         <h2 className="text-2xl font-black tracking-tight flex items-center gap-4">
                            <LayoutGrid className="w-8 h-8 text-primary" />
                            Live Inventory
                         </h2>
                         <Badge variant="outline" className="rounded-full px-6 py-2 font-black uppercase text-[10px]">
                            {products.length} High-Value Units
                         </Badge>
                      </div>

                      {products.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-24 text-center rounded-[4rem] border-2 border-dashed border-border/50 bg-background/50 backdrop-blur-xl">
                          <Package className="w-20 h-20 text-muted-foreground/30 mb-8" />
                          <h3 className="text-2xl font-black text-foreground mb-4">Marketplace Ghost</h3>
                          <p className="text-muted-foreground mb-10 max-w-sm font-medium">Your digital storefront is currently empty. List your building materials to start fulfilling demand.</p>
                          <Button onClick={() => setIsAddProductOpen(true)} size="lg" className="rounded-2xl font-black px-12 group">
                             Stock First Unit
                             <Plus className="ml-3 w-5 h-5 group-hover:rotate-90 transition-transform" />
                          </Button>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                          {products.map((p, idx) => (
                            <motion.div
                              key={p.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              whileHover={{ y: -8 }}
                            >
                              <Card className="overflow-hidden group border-border/50 shadow-xl bg-background rounded-[2.5rem] hover:border-primary/30 transition-all">
                                <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                                  {p.images && p.images.length > 0 ? (
                                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full opacity-20"><Search className="w-12 h-12"/></div>
                                  )}
                                  <div className="absolute top-4 right-4">
                                    <Badge className={`${p.is_published ? "bg-primary text-white" : "bg-background/80 backdrop-blur-md text-foreground"} px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] shadow-lg`}>
                                      {p.is_published ? "Live" : "Draft"}
                                    </Badge>
                                  </div>
                                </div>
                                <CardContent className="p-8">
                                  <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mb-2">{p.category}</p>
                                  <h3 className="font-black text-xl text-foreground line-clamp-1 mb-4">{p.name}</h3>
                                  <div className="flex items-end justify-between border-t border-border/30 pt-6">
                                     <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Unit Valuation</p>
                                        <p className="text-2xl font-black text-foreground">₹{p.price.toLocaleString()}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Availability</p>
                                        <p className="text-sm font-black text-primary">{p.stock_qty} {p.unit}s</p>
                                     </div>
                                  </div>
                                </CardContent>
                                <CardFooter className="p-6 pt-0 flex gap-3 border-t border-border/20 bg-muted/10">
                                  <div className="flex items-center gap-3 pt-4 flex-1">
                                    <Switch checked={p.is_published} onCheckedChange={() => togglePublish(p.id, p.is_published)} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{p.is_published ? 'Market Ready' : 'Hidden'}</span>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button size="icon" variant="outline" onClick={() => handleEditProduct(p)} className="h-10 w-10 rounded-xl border-2 hover:bg-primary hover:text-white transition-all"><Pencil className="w-4 h-4"/></Button>
                                    <Button size="icon" variant="destructive" onClick={() => deleteProduct(p.id)} className="h-10 w-10 rounded-xl shadow-lg shadow-destructive/10"><Trash className="w-4 h-4"/></Button>
                                  </div>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ADD/EDIT PRODUCT FORM */}
                  {activeTab === "products" && isAddProductOpen && (
                    <Reveal width="100%" direction="up">
                      <div className="max-w-5xl mx-auto pb-20">
                        <div className="flex items-center justify-end mb-8">
                           <Button variant="ghost" onClick={() => { setIsAddProductOpen(false); resetProductForm(); }} className="font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-foreground">
                             <X className="w-4 h-4 mr-2" /> Cancel Operation
                           </Button>
                        </div>

                        <Card className="border-border/50 shadow-2xl bg-background rounded-[3.5rem] overflow-hidden group">
                          <div className="bg-primary/5 px-12 py-10 border-b border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/20">
                                <PackageOpen className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-black tracking-tight text-foreground">{editingProduct ? "Refine Inventory" : "Strategic Admission"}</h3>
                                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Foundational Specifications</p>
                              </div>
                            </div>
                            <Zap className="w-10 h-10 text-primary opacity-20" />
                          </div>
                          <CardContent className="p-12 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Product Identity *</Label>
                                <Input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="E.g. Marine Grade Plywood" className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black text-lg" />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Architectural Brand *</Label>
                                <Input required value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} placeholder="E.g. CenturyPly" className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black text-lg" />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Market Category *</Label>
                                <Select value={productForm.category} onValueChange={v => setProductForm({...productForm, category: v})}>
                                  <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-transparent font-black"><SelectValue placeholder="Select Category" /></SelectTrigger>
                                  <SelectContent className="rounded-2xl">{CATEGORIES.map(c => <SelectItem key={c.id} value={c.id} className="rounded-xl">{c.label}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Standard Metric *</Label>
                                <Select value={productForm.unit} onValueChange={v => setProductForm({...productForm, unit: v})}>
                                  <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-transparent font-black"><SelectValue placeholder="Select Metric" /></SelectTrigger>
                                  <SelectContent className="rounded-2xl">{UNITS.map(u => <SelectItem key={u} value={u} className="rounded-xl">{u}</SelectItem>)}</SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Base Valuation (₹) *</Label>
                                <Input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="0" className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black text-xl text-primary" />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">MSRP / Original (₹)</Label>
                                <Input type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} placeholder="0" className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black text-xl text-muted-foreground" />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-secondary/20 p-10 rounded-[3rem] border border-border/50 group-hover:border-primary/20 transition-colors">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bulk Tier Price (₹)</Label>
                                <Input type="number" value={productForm.bulk_price} onChange={e => setProductForm({...productForm, bulk_price: e.target.value})} placeholder="Discounted" className="h-12 rounded-xl bg-background border-transparent font-bold" />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bulk Threshold</Label>
                                <Input type="number" value={productForm.bulk_min_qty} onChange={e => setProductForm({...productForm, bulk_min_qty: e.target.value})} placeholder="Min Units" className="h-12 rounded-xl bg-background border-transparent font-bold" />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vault Inventory</Label>
                                <Input type="number" value={productForm.stock_qty} onChange={e => setProductForm({...productForm, stock_qty: e.target.value})} placeholder="In Stock" className="h-12 rounded-xl bg-background border-transparent font-black text-primary" />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Technical Specification Narrative</Label>
                              <Textarea 
                                value={productForm.description} 
                                onChange={e => setProductForm({...productForm, description: e.target.value})} 
                                rows={5} 
                                placeholder="Detail the material composition, engineering grades, and application zones..." 
                                className="rounded-[2.5rem] bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold p-8 shadow-inner"
                              />
                            </div>

                            <div className="space-y-8 pt-8 border-t border-border/30">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Visualization Suite (Max 5 Assets)</Label>
                                <Badge className="bg-primary/10 text-primary rounded-full px-5 py-1.5 font-black uppercase text-[9px] tracking-widest border border-primary/20">
                                  {productImages.length + existingImages.length} / 5 Selected
                                </Badge>
                              </div>

                              <div className="relative group/upload">
                                 <div className="border-4 border-dashed border-border/50 rounded-[4rem] bg-secondary/10 group-hover/upload:bg-primary/5 group-hover/upload:border-primary/40 transition-all flex flex-col items-center justify-center p-20 text-center space-y-6">
                                    <div className="w-24 h-24 bg-background rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/5 group-hover/upload:scale-110 transition-transform duration-500">
                                       <Upload className="w-12 h-12 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                      <p className="font-black text-foreground uppercase text-base tracking-widest">Transmit Assets to Cloud</p>
                                      <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">PNG, JPG, WEBP • Max 5MB Each</p>
                                    </div>
                                    <Button type="button" variant="outline" className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-[10px] bg-background border-2 hover:bg-primary hover:text-white transition-all pointer-events-none">
                                      Select Media Files
                                    </Button>
                                 </div>
                                 <Input 
                                   type="file" 
                                   multiple 
                                   accept="image/*" 
                                   className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full w-full" 
                                   onChange={e => {
                                      if(e.target.files) {
                                        const filesArr = Array.from(e.target.files);
                                        if (productImages.length + filesArr.length + existingImages.length > 5) {
                                          toast({ variant: "destructive", title: "Max 5 Images" });
                                          return;
                                        }
                                        setProductImages([...productImages, ...filesArr]);
                                      }
                                   }} 
                                   title=""
                                   value=""
                                 />
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-8">
                                <AnimatePresence mode="popLayout">
                                  {existingImages.map((url, i) => (
                                    <motion.div 
                                      key={`existing-${url}`} 
                                      layout 
                                      initial={{ scale: 0.8, opacity: 0 }} 
                                      animate={{ scale: 1, opacity: 1 }} 
                                      exit={{ scale: 0.5, opacity: 0 }} 
                                      className="relative aspect-square rounded-[2rem] border-2 border-primary/20 overflow-hidden group/img shadow-2xl"
                                    >
                                       <img src={url} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" alt="existing" />
                                       <div className="absolute inset-0 bg-destructive/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-12 h-12" onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))}>
                                             <Trash className="w-6 h-6" />
                                          </Button>
                                       </div>
                                    </motion.div>
                                  ))}
                                  {productImages.map((file, i) => (
                                    <motion.div 
                                      key={`new-${file.name}-${i}`} 
                                      layout 
                                      initial={{ scale: 0.8, opacity: 0 }} 
                                      animate={{ scale: 1, opacity: 1 }} 
                                      exit={{ scale: 0.5, opacity: 0 }} 
                                      className="relative aspect-square rounded-[2rem] border-2 border-border/50 overflow-hidden group/img shadow-2xl"
                                    >
                                       <img src={URL.createObjectURL(file)} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" alt="preview" />
                                       <div className="absolute inset-0 bg-destructive/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-12 h-12" onClick={() => setProductImages(productImages.filter((_, idx) => idx !== i))}>
                                             <Trash className="w-6 h-6" />
                                          </Button>
                                       </div>
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-6 pt-10 border-t border-border/30">
                              <Button variant="outline" className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 shadow-sm transition-all hover:bg-secondary" disabled={isUploading} onClick={() => submitProduct(false)}>
                                 <Zap className="mr-3 w-4 h-4 text-primary" /> Archive as Stock Draft
                              </Button>
                              <Button className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 group relative overflow-hidden" disabled={isUploading || !productForm.name || !productForm.price} onClick={() => submitProduct(true)}>
                                 <span className="relative z-10 flex items-center gap-4">
                                    {isUploading ? (
                                      <>
                                         <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                         Syncing Vault...
                                      </>
                                    ) : (
                                      <>
                                         {editingProduct ? "Authorize Inventory Update" : "Launch in Marketplace"}
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
                          </CardContent>
                        </Card>
                      </div>
                    </Reveal>
                  )}

                  {/* INQUIRIES LIST */}
                  {activeTab === "inquiries" && (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                         <h2 className="text-2xl font-black tracking-tight flex items-center gap-4">
                            <ClipboardList className="w-8 h-8 text-primary" />
                            Marketplace Orders
                         </h2>
                         <Badge className="bg-destructive text-white rounded-full px-6 py-2 font-black uppercase text-[10px] animate-pulse">
                            {inquiries.filter(i => i.status === 'pending').length} Critical Alerts
                         </Badge>
                      </div>

                      {inquiries.length === 0 ? (
                        <div className="text-center py-32 bg-secondary/10 rounded-[4rem] border-2 border-dashed border-border/50">
                           <TrendingUp className="w-16 h-16 text-muted-foreground/10 mx-auto mb-6" />
                           <p className="text-muted-foreground/60 font-black text-sm uppercase tracking-widest">Market demand signals will appear here.</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {inquiries.map((inq, idx) => (
                            <motion.div
                               key={inq.id}
                               initial={{ opacity: 0, y: 10 }}
                               whileInView={{ opacity: 1, y: 0 }}
                               transition={{ delay: idx * 0.1 }}
                            >
                               <Card className="p-8 md:p-12 border-border/50 shadow-xl bg-background rounded-[3rem] group hover:border-primary/20 transition-all">
                                  <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
                                     <div className="flex-1 space-y-8">
                                        <div className="flex gap-4 items-center">
                                          <Badge className={`${inq.status === 'pending' ? 'bg-destructive text-white' : inq.status === 'contacted' ? 'bg-primary text-white' : 'bg-secondary text-foreground'} px-6 py-2 rounded-full font-black uppercase tracking-widest text-[9px] shadow-sm`}>
                                            {inq.status}
                                          </Badge>
                                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                             <ShieldCheck className="w-3 h-3" /> Digital Ledger: {new Date(inq.created_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                        
                                        <div>
                                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Subject Requirement</p>
                                           <h3 className="text-3xl font-black text-foreground tracking-tight">{inq.supplier_products?.name || "Premium Construct"}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-border/30 pt-8">
                                           <div className="space-y-4">
                                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inquiry Source</p>
                                              <div className="space-y-2">
                                                 <p className="text-xl font-black text-foreground">{inq.name}</p>
                                                 <p className="text-sm font-bold text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> {inq.city}</p>
                                              </div>
                                           </div>
                                           <div className="space-y-4">
                                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volume Required</p>
                                              <div className="flex items-center gap-3">
                                                 <div className="px-6 py-3 bg-secondary rounded-2xl font-black text-2xl text-primary">{inq.quantity}</div>
                                                 <span className="text-xs font-black uppercase text-muted-foreground">Units</span>
                                              </div>
                                           </div>
                                        </div>

                                        {inq.message && (
                                           <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                                              <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-4">Customer Brief</p>
                                              <p className="font-bold italic text-foreground/80 leading-relaxed">"{inq.message}"</p>
                                           </div>
                                        )}
                                     </div>

                                     <div className="w-full lg:w-80 space-y-6 lg:sticky lg:top-8">
                                        <div className="p-8 bg-secondary/30 rounded-[2.5rem] border border-border/50">
                                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Engagement Console</p>
                                           <div className="space-y-4 mb-8">
                                              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black group transition-all hover:bg-primary hover:text-white hover:border-primary" asChild>
                                                 <a href={`tel:${inq.phone}`}>
                                                    <Phone className="w-4 h-4 mr-3 group-hover:animate-bounce" /> {inq.phone}
                                                 </a>
                                              </Button>
                                              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black group" disabled>
                                                 <Mail className="w-4 h-4 mr-3" /> Market Messenger
                                              </Button>
                                           </div>
                                           <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">System Status</Label>
                                           <Select value={inq.status} onValueChange={(v) => updateInquiryStatus(inq.id, v)}>
                                              <SelectTrigger className="h-14 rounded-2xl bg-background border-transparent font-black"><SelectValue/></SelectTrigger>
                                              <SelectContent className="rounded-2xl">
                                                <SelectItem value="pending" className="rounded-xl">Pending Alert</SelectItem>
                                                <SelectItem value="contacted" className="rounded-xl">Client Contacted</SelectItem>
                                                <SelectItem value="closed" className="rounded-xl">Case Resolved</SelectItem>
                                              </SelectContent>
                                           </Select>
                                        </div>
                                     </div>
                                  </div>
                               </Card>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BUSINESS PROFILE */}
                  {activeTab === "profile" && (
                    <div className="max-w-4xl mx-auto">
                      <Card className="border-border/50 shadow-2xl bg-background rounded-[4rem] overflow-hidden">
                        <div className="bg-primary/5 px-12 py-10 border-b border-border/50 flex items-center justify-between">
                           <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-background rounded-[1.5rem] flex items-center justify-center shadow-sm">
                                 <Store className="w-8 h-8 text-primary" />
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black tracking-tight text-foreground">Economic Entity</h3>
                                 <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Institutional Profile</p>
                              </div>
                           </div>
                           <ShieldCheck className="w-10 h-10 text-primary opacity-20" />
                        </div>
                        <CardContent className="p-12 space-y-12">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Certified Business Name</Label>
                              <Input value={profileForm.business_name} onChange={e => setProfileForm({...profileForm, business_name: e.target.value})} className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black text-lg" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Verified Email (Primary)</Label>
                              <Input value={user?.email || ""} readOnly className="h-14 rounded-2xl bg-secondary/10 border-transparent transition-all font-bold opacity-60 cursor-not-allowed" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Authorized Signatory (Locked)</Label>
                              <Input value={profileForm.owner_name} readOnly className="h-14 rounded-2xl bg-secondary/10 border-transparent transition-all font-bold opacity-60 cursor-not-allowed" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Commercial Hotline (Locked)</Label>
                              <Input value={profileForm.phone} readOnly className="h-14 rounded-2xl bg-secondary/10 border-transparent transition-all font-bold opacity-60 cursor-not-allowed" />
                              <p className="text-[10px] text-muted-foreground ml-1">Contact support to update verified identity details.</p>
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Logistics Hub (City)</Label>
                              <Input value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black text-lg" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">GST Identification (GSTIN)</Label>
                              <Input value={profileForm.gst_number} onChange={e => setProfileForm({...profileForm, gst_number: e.target.value})} placeholder="00XXXXX0000X0Z0" className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black" />
                            </div>
                            <div className="space-y-3">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Zip / Pincode</Label>
                              <Input value={profileForm.pincode} onChange={e => setProfileForm({...profileForm, pincode: e.target.value})} className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-black" />
                            </div>
                          </div>
                          <div className="space-y-3 pt-6 border-t border-border/30">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Corporate Site Address</Label>
                            <Textarea value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} rows={3} className="rounded-[2.5rem] bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold p-8" />
                          </div>
                          <div className="flex justify-end">
                             <Button size="lg" onClick={handleUpdateProfile} className="h-16 px-12 rounded-2xl font-black shadow-xl shadow-primary/20 group relative overflow-hidden">
                               <span className="relative z-10 flex items-center gap-3">
                                  Sync Business Identity
                                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                               </span>
                               <motion.div 
                                className="absolute inset-0 bg-primary-foreground/10"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.5 }}
                              />
                             </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* ACCOUNT SETTINGS */}
                  {activeTab === "account" && (
                    <div className="max-w-2xl mx-auto">
                      <Card className="border-border/50 shadow-2xl bg-background rounded-[3.5rem] overflow-hidden">
                        <div className="bg-destructive/5 px-12 py-10 border-b border-border/50 flex items-center justify-between">
                           <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-background rounded-[1.5rem] flex items-center justify-center shadow-sm">
                                 <Settings className="w-8 h-8 text-destructive" />
                              </div>
                              <div>
                                 <h3 className="text-2xl font-black tracking-tight text-foreground">Control Center</h3>
                                 <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">System & Security</p>
                              </div>
                           </div>
                        </div>
                        <CardContent className="p-12 space-y-12">
                          <div className="p-10 rounded-[2.5rem] bg-secondary/20 border-2 border-dashed border-border/50 text-center">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">Identity Access Token</Label>
                            <p className="text-2xl font-black text-foreground break-all">{user?.email}</p>
                          </div>
                          
                          <div className="space-y-4">
                             <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-2">Marketplace Status</p>
                             <div className="flex items-center justify-between p-8 rounded-3xl bg-secondary/10 border border-border/50">
                                <div className="flex items-center gap-4">
                                   <div className={`w-4 h-4 rounded-full ${supplierData?.is_verified ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
                                   <span className="font-black uppercase tracking-widest text-xs">{supplierData?.is_verified ? "Active Commercial Status" : "Verification Pending"}</span>
                                </div>
                                <Button variant="outline" className="rounded-xl h-12 border-2 text-[10px] uppercase font-black tracking-widest">Verify Store</Button>
                             </div>
                          </div>

                          <Button variant="destructive" size="lg" className="h-16 w-full rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-destructive/20 group" onClick={handleLogout}>
                            <LogOut className="w-5 h-5 mr-4 group-hover:-translate-x-2 transition-transform" />
                            Terminate Session
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
