import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { SellerHeader } from "@/components/seller/SellerHeader";
import { OverviewTab } from "@/components/seller/tabs/OverviewTab";
import { ListingsTab } from "@/components/seller/tabs/ListingsTab";
import { OrdersTab } from "@/components/seller/tabs/OrdersTab";
import { InquiriesTab } from "@/components/seller/tabs/InquiriesTab";
import { PaymentsTab } from "@/components/seller/tabs/PaymentsTab";
import { AccountTab } from "@/components/seller/tabs/AccountTab";
import { HelpTab } from "@/components/seller/tabs/HelpTab";
import { ProductSheet } from "@/components/seller/ProductSheet";
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  const [productForm, setProductForm] = useState({
    name: "", brand: "", category: "", sub_category: "", description: "",
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

  // Calculate discount automatically
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

  const { user: sessionData, isLoading: isSessionLoading } = useAuth();

  const { data: supplierData, isFetching: isSupplierLoading } = useQuery({
    queryKey: ['supplier-profile', sessionData?.id],
    enabled: !!sessionData?.id,
    queryFn: async (): Promise<any> => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", sessionData!.id)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) throw new Error('Needs setup');
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (!isSessionLoading && !sessionData) {
      navigate("/supplier/auth");
    }
  }, [sessionData, isSessionLoading, navigate]);

  useEffect(() => {
    if (!isSupplierLoading && !supplierData && sessionData && !isSessionLoading) {
      navigate("/supplier/setup");
    }
  }, [supplierData, isSupplierLoading, sessionData, isSessionLoading, navigate]);

  useEffect(() => {
    if (supplierData) {
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
    }
  }, [supplierData]);

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['supplier-products', sessionData?.id],
    enabled: !!sessionData?.id,
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase
        .from("supplier_products")
        .select("*")
        .eq("supplier_id", sessionData!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: inquiries = [], isLoading: isInquiriesLoading } = useQuery({
    queryKey: ['supplier-inquiries', sessionData?.id],
    enabled: !!sessionData?.id,
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase
        .from("bulk_inquiries")
        .select("*, supplier_products(name)")
        .eq("supplier_id", sessionData!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: platformSettings = [] } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('platform_settings').select('*');
      if (error) return [];
      return data;
    }
  });

  const getSetting = (key: string, defaultValue: string) => {
    const setting = (platformSettings as any[]).find((s: any) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['supplier-orders', sessionData?.id],
    enabled: !!sessionData?.id,
    queryFn: async (): Promise<any[]> => {
      console.log("Fetching orders for supplier dashboard...");
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) {
        if (error.code === '42P01') return []; // table missing
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} total orders from DB. Filtering...`);
      if (data && data.length > 0) {
        const rawOrders = data as any[];
        console.log("Raw orders data from DB:");
        console.table(rawOrders.map(o => ({ id: o.id, items: JSON.stringify(o.items).substring(0, 50) + "..." })));
      } else {
        console.warn("DB returned ZERO orders. This is likely an RLS policy issue.");
      }
      const supplierProductIds = new Set(products.map((p: any) => String(p.id)));
      const supplierId = sessionData!.id;
      
      const filtered = (data || []).filter((order: any) => {
        if (!order.items || !Array.isArray(order.items)) return false;
        
        return order.items.some((item: any) => {
          // 1. Direct match on supplier_id (New system)
          if (item.supplier_id === supplierId) return true;
          
          // 2. Match on product ID (Old system fallback)
          const pid = String(item.id || item.product_id);
          return supplierProductIds.has(pid);
        });
      });

      console.log(`Filtered down to ${filtered.length} orders for this supplier.`);
      return filtered;
    }
  });

  const inquiryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const { error } = await supabase.from("bulk_inquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['supplier-inquiries', sessionData?.id] });
      const previousInquiries = queryClient.getQueryData(['supplier-inquiries', sessionData?.id]);
      queryClient.setQueryData(['supplier-inquiries', sessionData?.id], (old: any) => 
        old?.map((inq: any) => inq.id === id ? { ...inq, status } : inq)
      );
      return { previousInquiries };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(['supplier-inquiries', sessionData?.id], context.previousInquiries);
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Inquiry Updated" });
    }
  });

  const orderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      toast({ title: "Order Status Updated" });
    },
    onError: (err) => {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  });

  const profileMutation = useMutation({
    mutationFn: async (form: any) => {
      const { error: supError } = await supabase
        .from("suppliers")
        .update(form)
        .eq("id", sessionData!.id);
      if (supError) throw supError;

      if (form.owner_name) {
        const { error: profError } = await supabase
          .from('profiles')
          .update({ full_name: form.owner_name })
          .eq('id', sessionData!.id);
        if (profError) throw profError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-profile'] });
      toast({ title: "Profile Synchronized! ✨" });
    },
    onError: (err) => {
      toast({ title: "Sync Error", description: err.message, variant: "destructive" });
    }
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(profileForm);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const resetProductForm = () => {
    setProductForm({
      name: "", brand: "", category: "", sub_category: "", description: "",
      price: "", original_price: "", discount: "", bulk_price: "", bulk_min_qty: "",
      unit: "piece", min_order_qty: "1", stock_qty: "0", delivery_info: "Free Delivery", 
      delivery_days: "5", tags: ""
    });
    setProductImages([]);
    setExistingImages([]);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      sub_category: product.sub_category || "",
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

  const submitProduct = async (isPublished: boolean) => {
    if (!sessionData) return;
    try {
      setIsUploading(true);
      const imageUrls: string[] = [...existingImages];

      for (const file of productImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${sessionData.id}/${fileName}`;
        
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
        supplier_id: sessionData.id,
        name: productForm.name,
        brand: productForm.brand,
        category: productForm.category,
        sub_category: productForm.sub_category,
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
        const { error } = await supabase.from("supplier_products").update(productPayload).eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Product Updated" });
      } else {
        const { error } = await supabase.from("supplier_products").insert(productPayload);
        if (error) throw error;
        await supabase.from("suppliers").update({ total_products: (supplierData?.total_products || 0) + 1 }).eq("id", sessionData.id);
        toast({ title: isPublished ? "Published to Marketplace!" : "Saved to Drafts" });
      }

      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      setIsAddProductOpen(false);
      resetProductForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: boolean }) => {
      const { error } = await supabase.from("supplier_products").update({ is_published: !status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({ title: "Visibility Updated" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("supplier_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({ title: "Product Deleted" });
    }
  });

  if (isSessionLoading || isSupplierLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcf9f6]">
        <div className="w-8 h-8 border-4 border-[#735c00]/20 border-t-[#735c00] rounded-full animate-spin"></div>
        <p className="mt-4 font-body text-xs font-bold uppercase tracking-widest text-[#74777d]">Loading Dashboard...</p>
      </div>
    );
  }

  // If queries are done but data is missing (it will redirect via useEffect soon)
  if (!sessionData || !supplierData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcf9f6]">
        <div className="w-8 h-8 border-4 border-[#735c00]/20 border-t-[#735c00] rounded-full animate-spin"></div>
        <p className="mt-4 font-body text-xs font-bold uppercase tracking-widest text-[#74777d]">Authenticating...</p>
      </div>
    );
  }

  if (!sessionData || !supplierData) return null;

  const pendingInquiriesCount = inquiries.filter((i: any) => i.status === 'pending').length;
  
  const getTabTitle = () => {
    switch(activeTab) {
      case 'overview': return 'Overview';
      case 'listings': return 'My Listings';
      case 'orders': return 'Orders';
      case 'inquiries': return 'Inquiries';
      case 'payments': return 'Payments';
      case 'account': return 'Account Settings';
      case 'help': return 'Help & Support';
      default: return 'Dashboard';
    }
  };

  const dashboardSettings = {
    commissionRate: parseFloat(getSetting('supplier_commission_pct', '10')) / 100,
    payoutStatuses: getSetting('payout_trigger_statuses', 'paid,pending,processing,shipped').split(',').map(s => s.trim())
  };

  return (
    <div className="flex h-screen bg-[#fcf9f6] font-body text-[#1c1c1a] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        .font-headline { font-family: 'Newsreader', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
      `}</style>
      
      <SellerSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen}
        pendingInquiriesCount={pendingInquiriesCount}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <SellerHeader 
          setIsMobileOpen={setIsMobileOpen} 
          supplierName={supplierData?.business_name || supplierData?.owner_name} 
          activeTabTitle={getTabTitle()}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "overview" && (
              <OverviewTab 
                supplierData={supplierData} 
                products={products} 
                orders={orders} 
                inquiries={inquiries}
                setActiveTab={setActiveTab} 
                settings={dashboardSettings}
              />
            )}
            
            {activeTab === "listings" && (
              <ListingsTab 
                products={products} 
                isLoading={isProductsLoading} 
                setIsAddProductOpen={setIsAddProductOpen}
                handleEditProduct={handleEditProduct}
                deleteProduct={(id) => {
                  if (window.confirm("Are you sure you want to delete this product?")) {
                    deleteProductMutation.mutate(id);
                  }
                }}
                togglePublish={(id, status) => togglePublishMutation.mutate({ id, status })}
                categories={CATEGORIES}
              />
            )}

            {activeTab === "orders" && (
              <OrdersTab 
                orders={orders} 
                isLoading={isOrdersLoading} 
                updateOrderStatus={(id, status) => orderMutation.mutate({ id, status })} 
              />
            )}

            {activeTab === "inquiries" && (
              <InquiriesTab 
                inquiries={inquiries} 
                isLoading={isInquiriesLoading} 
                updateInquiryStatus={(id, status) => inquiryMutation.mutate({ id, status })} 
              />
            )}

            {activeTab === "payments" && (
              <PaymentsTab orders={orders} settings={dashboardSettings} />
            )}

            {activeTab === "account" && (
              <AccountTab 
                profileForm={profileForm} 
                setProfileForm={setProfileForm} 
                handleUpdateProfile={handleUpdateProfile}
                handleLogout={handleLogout}
              />
            )}

            {activeTab === "help" && (
              <HelpTab />
            )}
          </div>
        </main>
      </div>

      <ProductSheet 
        isOpen={isAddProductOpen} 
        onClose={() => { setIsAddProductOpen(false); resetProductForm(); }}
        productForm={productForm}
        setProductForm={setProductForm}
        productImages={productImages}
        setProductImages={setProductImages}
        existingImages={existingImages}
        setExistingImages={setExistingImages}
        isUploading={isUploading}
        submitProduct={submitProduct}
        categories={CATEGORIES}
        units={UNITS}
        isEditing={!!editingProduct}
      />
    </div>
  );
}
