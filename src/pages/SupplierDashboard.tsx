import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, LayoutGrid, Store, LogOut, Package, Pencil, Trash, 
  ArrowRight, Mail, Phone, MapPin, ClipboardList, TrendingUp, 
  ShieldCheck, Plus, X, ArrowLeft, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

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
  const [supplierData, setSupplierData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userId, isLoading: isAuthLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState("products");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  const [productForm, setProductForm] = useState({
    name: "", brand: "", category: "", sub_category: "", specs: "", description: "",
    price: "", original_price: "", discount: "0", bulk_price: "", bulk_min_qty: "",
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
    if (isAuthLoading) return;
    void fetchData();
  }, [isAuthLoading, user, userId]);

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

      if (profileData && profileData.role !== "supplier") {
        navigate("/");
        return;
      }

      const { data: supplier, error: supplierErr } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (supplierErr) throw supplierErr;
      if (!supplier) {
        navigate("/supplier/setup");
        return;
      }
      const supplierData = supplier as {
        business_name?: string | null;
        owner_name?: string | null;
        phone?: string | null;
        city?: string | null;
        address?: string | null;
        pincode?: string | null;
        gst_number?: string | null;
        business_type?: string | null;
      };
      setSupplierData(supplierData);
      setProfileForm({
        business_name: supplierData.business_name || "",
        owner_name: supplierData.owner_name || "",
        phone: supplierData.phone || "",
        city: supplierData.city || "",
        address: supplierData.address || "",
        pincode: supplierData.pincode || "",
        gst_number: supplierData.gst_number || "",
        business_type: supplierData.business_type || ""
      });

      const { data: prods } = await supabase
        .from("supplier_products")
        .select("*")
        .eq("supplier_id", userId)
        .order("created_at", { ascending: false });
      setProducts(prods || []);

      const { data: inqs } = await supabase
        .from("bulk_inquiries")
        .select("*, supplier_products(name)")
        .eq("supplier_id", userId)
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
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
        .eq("id", userId);
      if (supplierError) throw supplierError;

      if (profileForm.owner_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: profileForm.owner_name })
          .eq('id', userId);
        if (profileError) throw profileError;
      }
      toast({ title: "Profile Synchronized! ✨", description: "Your business identity has been updated." });
      fetchData();
    } catch (err: any) {
      toast({ title: "Sync Error", description: err.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const submitProduct = async (isPublished: boolean) => {
    if (!userId) return;
    try {
      setIsUploading(true);
      const imageUrls: string[] = [...existingImages];

      for (const file of productImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${userId}/${fileName}`;
        
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
        supplier_id: userId,
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
        await supabase.from("suppliers").update({ total_products: (supplierData?.total_products || 0) + 1 }).eq("id", userId);
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
    if (!window.confirm("Are you sure you want to liquidate this product? This action cannot be undone.")) return;
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
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 bg-[#fcf9f6]">
          <div className="w-8 h-8 border-4 border-[#735c00]/20 border-t-[#735c00] rounded-full animate-spin"></div>
          <p className="font-body text-[10px] font-bold uppercase tracking-widest text-[#44474c]">Initializing Store Manifest...</p>
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
      
      <div className="bg-[#fcf9f6] text-[#1c1c1a] min-h-screen font-body w-full pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e2df 1px, transparent 1px), linear-gradient(90deg, #e5e2df 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
        
        <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10">
          
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-start">
            
            {/* Sidebar Controller */}
            <div className="w-full md:w-1/4 shrink-0 sticky top-32">
              <span className="font-headline italic text-2xl text-[#735c00] mb-4 block underline underline-offset-8 decoration-1 decoration-[#c4c6cc]">Logistics Hub.</span>
              <h1 className="text-6xl font-headline tracking-tight leading-none mb-4">
                Supplier <span className="italic">Manifest.</span>
              </h1>
              <div className="flex items-center gap-2 mb-8">
                 <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-[8px] uppercase tracking-widest border-[#e5e2df]">Verified Entity</Badge>
                 <span className="text-[10px] font-bold text-[#74777d] truncate max-w-[150px]">{supplierData?.business_name}</span>
              </div>

              <div className="space-y-4 pt-8">
                {[
                  { id: "products", label: "Inventory Registry", icon: LayoutGrid },
                  { id: "inquiries", label: "Demand Signals", icon: ClipboardList, badge: inquiries.filter(i => i.status === 'pending').length },
                  { id: "profile", label: "Business Identity", icon: Store },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsAddProductOpen(false); }}
                    className={`w-full flex items-center justify-between p-5 rounded-sm border transition-all relative group overflow-hidden ${activeTab === item.id && !isAddProductOpen ? "text-[#1c1c1a]" : "border-transparent text-[#74777d] hover:text-[#1c1c1a] hover:bg-white/50"}`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <item.icon className={`w-4 h-4 ${activeTab === item.id && !isAddProductOpen ? "text-[#735c00]" : ""}`} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
                    </div>
                    {item.badge ? <span className="w-5 h-5 bg-[#735c00] text-white text-[8px] rounded-full flex items-center justify-center font-bold relative z-10">{item.badge}</span> : null}
                    {activeTab === item.id && !isAddProductOpen && (
                      <motion.div
                        layoutId="active-sidebar-pill"
                        className="absolute inset-0 bg-white border border-[#735c00] shadow-sm z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
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
                  key={activeTab + (isAddProductOpen ? '-add' : '')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-[#e5e2df] p-8 md:p-12 rounded-sm shadow-sm min-h-[600px]"
                >
                  
                  {/* INVENTORY REGISTRY */}
                  {activeTab === "products" && !isAddProductOpen && (
                    <div className="space-y-12">
                      <div className="flex items-center justify-between border-b border-[#e5e2df] pb-8">
                        <div>
                           <h2 className="text-4xl font-headline tracking-tight mb-2">Live <span className="italic">Inventory.</span></h2>
                           <p className="text-xs font-body text-[#74777d]">Total Assets Tracked: {products.length}</p>
                        </div>
                        <button 
                          onClick={() => setIsAddProductOpen(true)}
                          className="h-12 px-8 bg-[#1c1c1a] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#735c00] transition-colors flex items-center gap-3"
                        >
                          <Plus className="w-4 h-4" /> Stock New Unit
                        </button>
                      </div>

                      {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
                          <Package className="w-12 h-12 mb-4" />
                          <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Zero Requisitions Found</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {products.map((p) => (
                            <div key={p.id} className="group border border-[#e5e2df] p-6 hover:border-[#735c00] transition-colors rounded-sm relative">
                              <div className="absolute top-6 right-6 z-10">
                                <Badge className={`${p.is_published ? "bg-[#735c00] text-white" : "bg-[#f6f3f0] text-[#74777d]"} font-bold text-[8px] uppercase tracking-widest border-none`}>{p.is_published ? "Live" : "Draft"}</Badge>
                              </div>
                              
                              <div className="aspect-video bg-[#f6f3f0] mb-6 overflow-hidden rounded-sm relative">
                                {p.images && p.images.length > 0 ? (
                                  <img src={p.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={p.name} />
                                ) : (
                                  <div className="flex items-center justify-center h-full opacity-20"><Package className="w-8 h-8"/></div>
                                )}
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#735c00] mb-1 block">{p.category}</span>
                                  <h3 className="text-lg font-headline font-bold leading-tight line-clamp-1">{p.name}</h3>
                                  <p className="text-[10px] font-body text-[#74777d] mt-1 italic">{p.brand}</p>
                                </div>

                                <div className="flex items-end justify-between pt-4 border-t border-[#f6f3f0]">
                                   <div>
                                      <p className="text-[9px] font-bold uppercase text-[#74777d] mb-1">Valuation</p>
                                      <p className="text-xl font-headline font-black">₹{p.price?.toLocaleString() || "0"}</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-[9px] font-bold uppercase text-[#74777d] mb-1">Vol</p>
                                      <p className="text-sm font-bold">{p.stock_qty} {p.unit}</p>
                                   </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                   <button 
                                     onClick={() => handleEditProduct(p)}
                                     className="flex-1 py-3 border border-[#e5e2df] text-[9px] uppercase font-bold tracking-widest hover:bg-[#1c1c1a] hover:text-white transition-all rounded-sm"
                                   >
                                     Refine
                                   </button>
                                   <button 
                                     onClick={() => deleteProduct(p.id)}
                                     className="w-12 h-12 flex items-center justify-center border border-[#e5e2df] hover:border-[#735c00] hover:text-[#735c00] transition-colors rounded-sm"
                                   >
                                     <Trash className="w-3 h-3" />
                                   </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ADMISSION FLOW */}
                  {activeTab === "products" && isAddProductOpen && (
                    <div className="space-y-12">
                      <header className="flex items-center justify-between border-b border-[#e5e2df] pb-8">
                        <div>
                           <h2 className="text-4xl font-headline tracking-tight mb-2">{editingProduct ? "Refine" : "Admission"} <span className="italic">Flow.</span></h2>
                           <p className="text-xs font-body text-[#74777d]">Synchronize new high-value units to the network.</p>
                        </div>
                        <button onClick={() => { setIsAddProductOpen(false); resetProductForm(); }} className="p-3 hover:bg-[#f6f3f0] rounded-full transition-colors"><X className="w-5 h-5 text-[#74777d]"/></button>
                      </header>

                      <div className="space-y-12">
                        {/* Section 1: Basic Identification */}
                        <div className="space-y-6">
                          <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#735c00] border-b border-[#e5e2df] pb-2">Basic Identification</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                             <div className="space-y-2">
                               <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Architectural Component *</label>
                               <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="E.g. Marine Grade Plywood" className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                             </div>
                             <div className="space-y-2">
                               <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Brand Registry *</label>
                               <input value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} placeholder="E.g. CenturyPly" className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                             </div>
                             <div className="space-y-2">
                               <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Logistical Sector *</label>
                               <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors appearance-none cursor-pointer">
                                 <option value="" disabled>Select Sector</option>
                                 {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                               </select>
                             </div>
                             <div className="space-y-2">
                               <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Standard Metric Unit</label>
                               <select value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors appearance-none cursor-pointer">
                                 {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                               </select>
                             </div>
                          </div>
                        </div>

                        {/* Section 2: Pricing Strategy */}
                        <div className="space-y-6">
                          <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#735c00] border-b border-[#e5e2df] pb-2">Pricing Strategy</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Base Valuation (₹)</label>
                              <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="0" className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body font-bold text-[#735c00]" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Market Value (₹)</label>
                              <input type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} placeholder="Discount baseline" className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Discount (%)</label>
                              <input readOnly value={productForm.discount} className="w-full px-4 py-4 bg-[#f6f3f0]/50 border border-transparent rounded-sm text-sm outline-none font-body font-bold text-green-700" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Bulk Valuation (₹)</label>
                              <input type="number" value={productForm.bulk_price} onChange={e => setProductForm({...productForm, bulk_price: e.target.value})} placeholder="Volume rate" className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Bulk Threshold (Qty)</label>
                              <input type="number" value={productForm.bulk_min_qty} onChange={e => setProductForm({...productForm, bulk_min_qty: e.target.value})} placeholder="Min units for bulk" className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Logistical Manifest */}
                        <div className="space-y-6">
                          <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#735c00] border-b border-[#e5e2df] pb-2">Logistical Manifest</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Vault Stock Volume</label>
                              <input type="number" value={productForm.stock_qty} onChange={e => setProductForm({...productForm, stock_qty: e.target.value})} placeholder="Operational Units" className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Minimum Order Quantity (MOQ)</label>
                              <input type="number" value={productForm.min_order_qty} onChange={e => setProductForm({...productForm, min_order_qty: e.target.value})} placeholder="1" className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Delivery Provision</label>
                              <input value={productForm.delivery_info} onChange={e => setProductForm({...productForm, delivery_info: e.target.value})} placeholder="E.g. Free Delivery above ₹20,000" className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Logistical Transit (Days)</label>
                              <input type="number" value={productForm.delivery_days} onChange={e => setProductForm({...productForm, delivery_days: e.target.value})} placeholder="5" className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                            </div>
                            <div className="col-span-full space-y-2">
                              <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Search Tags (Comma Separated)</label>
                              <input value={productForm.tags} onChange={e => setProductForm({...productForm, tags: e.target.value})} placeholder="Waterproof, Hardwood, Eco-friendly..." className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body" />
                            </div>
                          </div>
                        </div>

                        {/* Section 4: Media Allocation */}
                        <div className="space-y-6">
                           <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#735c00] border-b border-[#e5e2df] pb-2">Media Allocation</h3>
                           <div className="space-y-4">
                              <div className="aspect-video bg-[#f6f3f0] border-2 border-dashed border-[#e5e2df] relative group transition-colors hover:border-[#735c00]">
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                                   <Upload className="w-8 h-8 mb-2" />
                                   <p className="text-[10px] uppercase font-bold">Allocate Product Photography</p>
                                </div>
                                <input 
                                  type="file" 
                                  multiple 
                                  onChange={(e) => {
                                    if (e.target.files) {
                                      const files = Array.from(e.target.files);
                                      setProductImages(prev => [...prev, ...files]);
                                    }
                                  }} 
                                  className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                              </div>
                              
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                                 {existingImages.map((img, idx) => (
                                   <div key={`exist-${idx}`} className="relative aspect-square border border-[#e5e2df] group">
                                      <img src={img} className="w-full h-full object-cover" />
                                      <button onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X className="w-3 h-3"/></button>
                                   </div>
                                 ))}
                                 {productImages.map((file, idx) => (
                                   <div key={`new-${idx}`} className="relative aspect-square border-2 border-dashed border-[#735c00] bg-[#fcf9f6] flex items-center justify-center overflow-hidden group">
                                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                      <span className="absolute bottom-1 left-1 bg-[#735c00] text-white text-[6px] px-1 rounded-sm uppercase font-bold z-10">New</span>
                                      <button onClick={() => setProductImages(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg z-10"><X className="w-3 h-3"/></button>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* Section 5: Technical Narrative */}
                        <div className="space-y-6">
                           <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#735c00] border-b border-[#e5e2df] pb-2">Technical Narrative</h3>
                           <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Specification Commentary</label>
                             <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={4} placeholder="Detailed parameters and engineering standards..." className="w-full p-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors resize-none" />
                           </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-[#e5e2df] flex justify-end gap-4">
                        <button onClick={() => submitProduct(false)} disabled={isUploading} className="px-8 h-12 border border-[#e5e2df] text-[10px] font-bold uppercase tracking-widest hover:bg-[#fcf9f6] transition-all rounded-sm">Save Manifest Draft</button>
                        <button onClick={() => submitProduct(true)} disabled={isUploading || !productForm.name || !productForm.price} className="px-10 h-12 bg-[#1c1c1a] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#735c00] transition-all shadow-md">
                          {isUploading ? "Synchronizing..." : editingProduct ? "Update Admission" : "Execute Launch"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DEMAND SIGNALS */}
                  {activeTab === "inquiries" && (
                    <div className="space-y-12">
                      <header className="flex items-center justify-between border-b border-[#e5e2df] pb-8">
                        <div>
                           <h2 className="text-4xl font-headline tracking-tight mb-2">Demand <span className="italic">Signals.</span></h2>
                           <p className="text-xs font-body text-[#74777d]">Authenticated requests from executing operators.</p>
                        </div>
                        <Badge className="bg-destructive text-white font-black text-[9px] uppercase tracking-widest animate-pulse border-none">Critical Attention Required</Badge>
                      </header>

                      {inquiries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
                          <TrendingUp className="w-12 h-12 mb-4" />
                          <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Zero Signals Detected</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {inquiries.map((inq) => (
                             <div key={inq.id} className="border border-[#e5e2df] p-8 rounded-sm hover:border-[#735c00] transition-all group">
                                <div className="flex flex-col md:flex-row gap-8 justify-between">
                                  <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-4">
                                      <Badge variant="outline" className={`px-4 py-1.5 font-bold text-[8px] uppercase tracking-widest ${inq.status === 'pending' ? 'border-destructive text-destructive' : 'border-[#e5e2df] text-[#74777d]'}`}>{inq.status}</Badge>
                                      <span className="text-[10px] font-bold text-[#c4c6cc] tracking-tighter">Manifest: {new Date(inq.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="space-y-2">
                                       <span className="text-[9px] uppercase font-bold text-[#735c00]">Subject Requisition</span>
                                       <h3 className="text-2xl font-headline font-bold">{inq.supplier_products?.name || "System Component"}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[#f6f3f0]">
                                       <div>
                                          <span className="text-[9px] uppercase font-bold text-[#74777d]">Source</span>
                                          <p className="font-bold text-sm mt-1">{inq.name}</p>
                                          <p className="text-[10px] font-body text-[#74777d]">{inq.city}</p>
                                       </div>
                                       <div>
                                          <span className="text-[9px] uppercase font-bold text-[#74777d]">Volume</span>
                                          <p className="font-headline font-black text-2xl mt-1">{inq.quantity} <span className="text-[10px] font-bold text-[#74777d]">U</span></p>
                                       </div>
                                    </div>
                                  </div>
                                  
                                  <div className="w-full md:w-64 space-y-3 pt-4 border-t md:border-t-0 md:border-l border-[#e5e2df] md:pl-8">
                                     <a href={`tel:${inq.phone}`} className="w-full h-12 flex items-center justify-center border border-[#e5e2df] text-[10px] font-bold uppercase tracking-widest hover:bg-[#1c1c1a] hover:text-white transition-all rounded-sm gap-3">
                                        <Phone className="w-3 h-3" /> Execute Call
                                     </a>
                                     <select value={inq.status} onChange={(e) => updateInquiryStatus(inq.id, e.target.value)} className="w-full h-12 border border-[#735c00] text-[#735c00] text-[9px] font-black uppercase tracking-widest rounded-sm bg-transparent px-4 outline-none cursor-pointer">
                                        <option value="pending">Pending</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="closed">Fulfilled</option>
                                     </select>
                                  </div>
                                </div>
                             </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* IDENTITY MATRIX */}
                  {activeTab === "profile" && (
                     <div className="space-y-12">
                       <header className="border-b border-[#e5e2df] pb-8">
                          <h2 className="text-4xl font-headline tracking-tight mb-2">Identity <span className="italic">Matrix.</span></h2>
                          <p className="text-xs font-body text-[#74777d]">Manage the logistical presence of your corporate entity.</p>
                       </header>
                       
                       <form onSubmit={handleUpdateProfile} className="space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                             <div className="space-y-2">
                               <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Corporate Title</label>
                               <input value={profileForm.business_name} onChange={e => setProfileForm({...profileForm, business_name: e.target.value})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                             </div>
                             <div className="space-y-2">
                               <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Authorized Director</label>
                               <input value={profileForm.owner_name} onChange={e => setProfileForm({...profileForm, owner_name: e.target.value})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                             </div>
                             <div className="space-y-2">
                               <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Identity Contact</label>
                               <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                             </div>
                             <div className="space-y-2">
                               <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Federal State / City</label>
                               <input value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                             </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c1a] opacity-60">Structural Headquarters</label>
                            <input value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} className="w-full px-4 py-4 bg-[#f6f3f0] border border-transparent focus:border-[#735c00] rounded-sm text-sm outline-none font-body transition-colors" />
                          </div>

                          <div className="flex justify-end pt-8 border-t border-[#e5e2df]">
                             <button type="submit" className="h-14 px-12 bg-[#1c1c1a] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#735c00] transition-all shadow-md">Update Vector Identity</button>
                          </div>
                       </form>
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
