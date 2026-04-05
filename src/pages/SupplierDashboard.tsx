import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Upload, PackageOpen, LayoutGrid, UserCircle, Settings, Store, Search, LogOut, CheckCircle2, Package, Pencil, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  
  // Product Form State
  const [productForm, setProductForm] = useState({
    name: "", brand: "", category: "", sub_category: "", specs: "", description: "",
    price: "", original_price: "", discount: "", bulk_price: "", bulk_min_qty: "",
    unit: "piece", min_order_qty: "1", stock_qty: "0", delivery_info: "Free Delivery", 
    delivery_days: "5", tags: ""
  });
  const [productImages, setProductImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Profile Form State
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
        .single();

      if (supplierErr) throw supplierErr;
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
      toast({ title: "Error", description: "Could not load data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/supplier/auth");
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await supabase.from("suppliers").update({
        business_name: profileForm.business_name,
        owner_name: profileForm.owner_name,
        phone: profileForm.phone,
        city: profileForm.city,
        address: profileForm.address,
        pincode: profileForm.pincode,
        gst_number: profileForm.gst_number,
        business_type: profileForm.business_type
      }).eq("id", user.id);
      
      toast({ title: "Profile Updated" });
      fetchData();
    } catch (err) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const submitProduct = async (isPublished: boolean) => {
    if (!user) return;
    try {
      setIsUploading(true);
      const imageUrls: string[] = [];

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

      const { error } = await supabase.from("supplier_products").insert({
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
      });

      if (error) throw error;
      
      await supabase.from("suppliers").update({ total_products: (supplierData?.total_products || 0) + 1 }).eq("id", user.id);

      toast({ title: isPublished ? "Product Published!" : "Product Draft Saved!" });
      setIsAddProductOpen(false);
      resetProductForm();
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to save product", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    await supabase.from("supplier_products").update({ is_published: !currentStatus }).eq("id", id);
    fetchData();
  };

  const updateInquiryStatus = async (id: number, status: string) => {
    await supabase.from("bulk_inquiries").update({ status }).eq("id", id);
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("supplier_products").delete().eq("id", id);
    toast({ title: "Product Deleted" });
    fetchData();
  };

  const resetProductForm = () => {
    setProductForm({
      name: "", brand: "", category: "", sub_category: "", specs: "", description: "",
      price: "", original_price: "", discount: "", bulk_price: "", bulk_min_qty: "",
      unit: "piece", min_order_qty: "1", stock_qty: "0", delivery_info: "Free Delivery", 
      delivery_days: "5", tags: ""
    });
    setProductImages([]);
  };

  if (isLoading) return <Layout><div className="flex justify-center py-20">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="bg-secondary/20 min-h-screen py-8">
        <div className="container mx-auto px-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-card p-6 rounded-xl border shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Supplier Dashboard</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Store className="w-4 h-4" /> {supplierData?.business_name}
                {supplierData?.is_verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </p>
            </div>
            {activeTab === "products" && !isAddProductOpen && (
              <Button onClick={() => setIsAddProductOpen(true)}>
                <PackageOpen className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            )}
            {activeTab === "products" && isAddProductOpen && (
              <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Back to list</Button>
            )}
          </div>

          <div className="grid md:grid-cols-[200px_1fr] gap-8">
            <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
              <Button variant={activeTab === "products" ? "default" : "ghost"} className="justify-start w-full" onClick={() => {setActiveTab("products"); setIsAddProductOpen(false);}}>
                <LayoutGrid className="w-4 h-4 mr-2" /> My Products
              </Button>
              <Button variant={activeTab === "inquiries" ? "default" : "ghost"} className="justify-start w-full relative" onClick={() => setActiveTab("inquiries")}>
                <Package className="w-4 h-4 mr-2" /> Bulk Inquiries
                {inquiries.filter(i => i.status === 'pending').length > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {inquiries.filter(i => i.status === 'pending').length}
                  </span>
                )}
              </Button>
              <Button variant={activeTab === "profile" ? "default" : "ghost"} className="justify-start w-full" onClick={() => setActiveTab("profile")}>
                <UserCircle className="w-4 h-4 mr-2" /> Business Profile
              </Button>
              <Button variant={activeTab === "account" ? "default" : "ghost"} className="justify-start w-full" onClick={() => setActiveTab("account")}>
                <Settings className="w-4 h-4 mr-2" /> Account Settings
              </Button>
            </nav>

            <div className="bg-card rounded-xl border p-6 min-h-[500px] shadow-sm">
              
              {/* SECTION A & B: PRODUCTS */}
              {activeTab === "products" && (
                <div>
                  {!isAddProductOpen ? (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">Product Inventory</h2>
                      {products.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                          <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>You haven't uploaded any products yet.</p>
                          <Button className="mt-4" onClick={() => setIsAddProductOpen(true)}>Add your first product</Button>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {products.map(p => (
                            <Card key={p.id} className="overflow-hidden">
                              <div className="aspect-[4/3] bg-muted relative">
                                {p.images && p.images.length > 0 ? (
                                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="flex items-center justify-center h-full"><Search className="text-muted-foreground/30 w-12 h-12"/></div>
                                )}
                                <Badge className="absolute top-2 right-2" variant={p.is_published ? "default" : "secondary"}>
                                  {p.is_published ? "Live" : "Draft"}
                                </Badge>
                              </div>
                              <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{p.category}</p>
                                <h3 className="font-semibold text-lg line-clamp-1">{p.name}</h3>
                                <p className="text-sm font-bold text-primary mt-1">₹{p.price}</p>
                                <p className="text-xs text-muted-foreground mt-2">Stock: {p.stock_qty} {p.unit}s</p>
                              </CardContent>
                              <CardFooter className="p-4 pt-0 flex gap-2 border-t justify-between border-border bg-muted/20">
                                <div className="flex items-center gap-1.5 pt-3">
                                  <Switch checked={p.is_published} onCheckedChange={() => togglePublish(p.id, p.is_published)} />
                                  <span className="text-xs font-medium text-muted-foreground">{p.is_published ? 'Visible' : 'Hidden'}</span>
                                </div>
                                <div className="flex gap-1 pt-3">
                                  <Button size="icon" variant="destructive" onClick={() => deleteProduct(p.id)} className="h-8 w-8"><Trash className="w-4 h-4"/></Button>
                                </div>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">Add New Product</h2>
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Product Name*</Label>
                            <Input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Brand*</Label>
                            <Input required value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Category*</Label>
                            <Select value={productForm.category} onValueChange={v => setProductForm({...productForm, category: v})}>
                              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Unit*</Label>
                            <Select value={productForm.unit} onValueChange={v => setProductForm({...productForm, unit: v})}>
                              <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                              <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Selling Price (₹)*</Label>
                            <Input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Original Price (₹)</Label>
                            <Input type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 bg-muted/50 p-4 rounded-xl">
                          <div className="space-y-2">
                            <Label>Bulk Price (₹)</Label>
                            <Input type="number" value={productForm.bulk_price} onChange={e => setProductForm({...productForm, bulk_price: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Bulk Min Qty</Label>
                            <Input type="number" value={productForm.bulk_min_qty} onChange={e => setProductForm({...productForm, bulk_min_qty: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock Quantity</Label>
                            <Input type="number" value={productForm.stock_qty} onChange={e => setProductForm({...productForm, stock_qty: e.target.value})} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={3}/>
                        </div>

                        <div className="space-y-2 border p-4 rounded-xl border-dashed">
                          <Label>Product Images (Max 5)</Label>
                          <Input type="file" multiple accept="image/*" onChange={e => {
                            if(e.target.files) {
                              const filesArr = Array.from(e.target.files).slice(0, 5);
                              setProductImages(filesArr);
                            }
                          }} />
                          <p className="text-xs text-muted-foreground mt-1">{productImages.length} file(s) selected.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button variant="outline" disabled={isUploading || !productForm.name || !productForm.price} onClick={() => submitProduct(false)}>Save as Draft</Button>
                          <Button disabled={isUploading || !productForm.name || !productForm.price} onClick={() => submitProduct(true)}>
                            {isUploading ? "Publishing..." : "Publish Product"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION C: INQUIRIES */}
              {activeTab === "inquiries" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Bulk Order Inquiries</h2>
                  {inquiries.length === 0 ? (
                    <p className="text-muted-foreground italic">No inquiries received yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {inquiries.map(inq => (
                        <Card key={inq.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                          <div>
                            <div className="flex gap-2 items-center mb-1">
                              <Badge variant={inq.status === 'pending' ? 'destructive' : inq.status === 'contacted' ? 'default' : 'secondary'}>
                                {inq.status.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{new Date(inq.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-semibold text-foreground">{inq.supplier_products?.name || "Product"}</h3>
                            <p className="text-sm text-muted-foreground mt-1"><span className="font-medium text-foreground">{inq.name}</span> • {inq.city} • <a href={`tel:${inq.phone}`} className="text-primary hover:underline">{inq.phone}</a></p>
                            <p className="text-sm mt-2"><span className="font-medium">Quantity Req:</span> {inq.quantity}</p>
                            {inq.message && <p className="text-sm mt-1 bg-muted p-2 rounded text-muted-foreground">"{inq.message}"</p>}
                          </div>
                          <div className="w-full md:w-32">
                            <Select value={inq.status} onValueChange={(v) => updateInquiryStatus(inq.id, v)}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION D: PROFILE */}
              {activeTab === "profile" && (
                <div className="max-w-xl">
                  <h2 className="text-xl font-semibold mb-6">Business Profile</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input value={profileForm.business_name} onChange={e => setProfileForm({...profileForm, business_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Owner Name</Label>
                        <Input value={profileForm.owner_name} onChange={e => setProfileForm({...profileForm, owner_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>GST Number</Label>
                        <Input value={profileForm.gst_number} onChange={e => setProfileForm({...profileForm, gst_number: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Full Address</Label>
                      <Textarea value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} />
                    </div>
                    <Button onClick={handleUpdateProfile} className="mt-4">Save Changes</Button>
                  </div>
                </div>
              )}

              {/* SECTION E: ACCOUNT */}
              {activeTab === "account" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg">
                      <Label>Registered Email</Label>
                      <p className="text-foreground font-medium mt-1">{user?.email}</p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
