import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";

// Modular Seller Components
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { SellerHeader } from "@/components/seller/SellerHeader";
import { ProductSheet } from "@/components/seller/ProductSheet";

// Tabs
import { OverviewTab } from "@/components/seller/tabs/OverviewTab";
import { ListingsTab } from "@/components/seller/tabs/ListingsTab";
import { OrdersTab } from "@/components/seller/tabs/OrdersTab";
import { InquiriesTab } from "@/components/seller/tabs/InquiriesTab";
import { PaymentsTab } from "@/components/seller/tabs/PaymentsTab";
import { AccountTab } from "@/components/seller/tabs/AccountTab";
import { HelpTab } from "@/components/seller/tabs/HelpTab";

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

interface Supplier {
  id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  city: string;
  address: string;
  pincode: string;
  gst_number: string;
  business_type: string;
}

export default function SupplierDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [supplierData, setSupplierData] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [commissionRate, setCommissionRate] = useState(0.1); // Default 10%
  const [payoutStatuses, setPayoutStatuses] = useState<string[]>(['paid', 'pending', 'processing', 'shipped']);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Product Management State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    category: "",
    sub_category: "",
    specs: "",
    description: "",
    price: "",
    original_price: "",
    discount: "0",
    bulk_price: "",
    bulk_min_qty: "",
    unit: "piece",
    min_order_qty: "1",
    stock_qty: "0",
    delivery_info: "Free Delivery",
    delivery_days: "5",
    tags: "",
  });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    business_name: "",
    owner_name: "",
    phone: "",
    city: "",
    address: "",
    pincode: "",
    gst_number: "",
    business_type: "",
  });

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time order updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          console.log("Real-time: Order change detected, re-fetching...");
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-calculate discount
  useEffect(() => {
    if (productForm.price && productForm.original_price) {
      const price = parseFloat(productForm.price);
      const original = parseFloat(productForm.original_price);
      if (original > price && original > 0) {
        const disc = Math.round(((original - price) / original) * 100);
        setProductForm((prev) => ({ ...prev, discount: disc.toString() }));
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

      // Verify Role
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileData && profileData.role !== "supplier") {
        navigate("/");
        return;
      }

      // Fetch Supplier Profile
      const { data: supplierRaw, error: supplierErr } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (supplierErr) throw supplierErr;
      if (!supplierRaw) {
        navigate("/supplier/setup");
        return;
      }
      
      const supplier = supplierRaw as Supplier;
      setSupplierData(supplier);
      setProfileForm({
        business_name: supplier.business_name || "",
        owner_name: supplier.owner_name || "",
        phone: supplier.phone || "",
        city: supplier.city || "",
        address: supplier.address || "",
        pincode: supplier.pincode || "",
        gst_number: supplier.gst_number || "",
        business_type: supplier.business_type || "",
      });

      // Fetch platform settings for commission and payouts
      const { data: allSettings } = await supabase
        .from("platform_settings")
        .select("*")
        .in("key", ["supplier_commission_pct", "payout_trigger_statuses"]);

      const settingsArray = (allSettings || []) as any[];
      const commissionSetting = settingsArray.find(s => s.key === "supplier_commission_pct");
      const payoutStatusSetting = settingsArray.find(s => s.key === "payout_trigger_statuses");

      if (commissionSetting?.value) {
        setCommissionRate(parseFloat(commissionSetting.value) / 100);
      }
      
      const activePayoutStatuses = payoutStatusSetting?.value 
        ? payoutStatusSetting.value.split(',').map((s: string) => s.trim())
        : ['paid', 'pending', 'processing', 'shipped'];
      
      setPayoutStatuses(activePayoutStatuses);
      console.log("Dashboard Sync: Commission Rate:", (commissionSetting?.value || "10") + "%");
      console.log("Dashboard Sync: Payout Statuses:", activePayoutStatuses);

      // Fetch Products
      const { data: prods } = await supabase
        .from("supplier_products")
        .select("*")
        .eq("supplier_id", session.user.id);
      setProducts(prods || []);

      const { data: inqs } = await supabase
        .from("supplier_inquiries")
        .select(`*, supplier_products(name)`)
        .eq("supplier_id", session.user.id)
        .order("created_at", { ascending: false });
      setInquiries(inqs || []);

      // Fetch Orders - Using JSON searching since the supplier_id column doesn't exist in the schema
      // 1. Search within the items JSON array (Main strategy)
      const { data: ordsByJson } = await supabase
        .from("orders")
        .select("*")
        .contains("items", [{ supplier_id: session.user.id }]);

      // 2. Fallback: Fetch a batch of recent orders and filter in JS 
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const recentOrdersArray = (recentOrders || []) as any[];
      const combinedOrders: any[] = [
        ...(ordsByJson || []),
        ...recentOrdersArray.filter(o => 
          Array.isArray(o.items) && 
          o.items.some((item: any) => item.supplier_id === session.user.id)
        )
      ];

      // Remove duplicates by ID and sort
      const uniqueOrders = Array.from(
        new Map(combinedOrders.map((o) => [o.id, o])).values(),
      ).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOrders(uniqueOrders);
      console.log("Dashboard Sync: Total Unique Orders:", uniqueOrders.length);

    } catch (err: any) {
      console.error("Dashboard sync error:", err);
      toast({
        title: "Sync Failed",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    });
    setExistingImages(product.images || []);
    setProductImages([]);
    setIsAddProductOpen(true);
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to decommission this product?")) return;
    try {
      const { error } = await supabase.from("supplier_products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Product Deleted" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("supplier_products")
        .update({ is_published: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast({ title: !currentStatus ? "Product Live" : "Product Hidden" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
      toast({ title: "Order Updated", description: `Status changed to ${status}` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateInquiryStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase.from("bulk_inquiries").update({ status }).eq("id", id);
      if (error) throw error;
      toast({ title: "Inquiry Updated" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase
        .from("suppliers")
        .update({
          business_name: profileForm.business_name,
          owner_name: profileForm.owner_name,
          phone: profileForm.phone,
          city: profileForm.city,
          address: profileForm.address,
          pincode: profileForm.pincode,
          gst_number: profileForm.gst_number,
          business_type: profileForm.business_type,
        })
        .eq("id", user.id);
      if (error) throw error;
      toast({ title: "Profile Updated" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const submitProduct = async (isPublished: boolean) => {
    if (!user) return;
    try {
      setIsUploading(true);
      const imageUrls: string[] = [...existingImages];

      // Handle Image Uploads
      for (const file of productImages) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }

      const tagsArray = productForm.tags
        ? productForm.tags.split(",").map((t) => t.trim()).filter((t) => t)
        : [];

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
        images: imageUrls,
        tags: tagsArray,
        is_published: isPublished,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("supplier_products")
          .update(productPayload)
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Product Updated" });
      } else {
        const { error } = await supabase.from("supplier_products").insert(productPayload);
        if (error) throw error;
        toast({ title: "Product Created" });
      }

      setIsAddProductOpen(false);
      setEditingProduct(null);
      setProductImages([]);
      setExistingImages([]);
      fetchData();
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'listings': return 'Product Management';
      case 'orders': return 'Order Fulfillment';
      case 'inquiries': return 'Customer Inquiries';
      case 'payments': return 'Financial Matrix';
      case 'account': return 'Business Profile';
      case 'help': return 'Support Hub';
      default: return 'Supplier Portal';
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f6] flex">
      <SellerSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen}
        pendingInquiriesCount={inquiries.filter(i => i.status === 'pending').length}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SellerHeader 
          setIsMobileOpen={setIsMobileOpen} 
          supplierName={supplierData?.business_name || ""} 
          activeTabTitle={getActiveTabTitle()}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <OverviewTab 
                    supplierData={supplierData} 
                    products={products} 
                    orders={orders} 
                    inquiries={inquiries} 
                    setActiveTab={setActiveTab}
                    settings={{ supplierId: user?.id, commissionRate, payoutStatuses }}
                  />
                )}
                {activeTab === 'listings' && (
                  <ListingsTab 
                    products={products} 
                    isLoading={isLoading} 
                    setIsAddProductOpen={setIsAddProductOpen}
                    handleEditProduct={handleEditProduct}
                    deleteProduct={deleteProduct}
                    togglePublish={togglePublish}
                    categories={CATEGORIES}
                  />
                )}
                {activeTab === 'orders' && (
                  <OrdersTab 
                    orders={orders} 
                    isLoading={isLoading} 
                    updateOrderStatus={updateOrderStatus}
                    settings={{ supplierId: user?.id, commissionRate, payoutStatuses }}
                  />
                )}
                {activeTab === 'inquiries' && (
                  <InquiriesTab 
                    inquiries={inquiries} 
                    isLoading={isLoading} 
                    updateInquiryStatus={updateInquiryStatus}
                  />
                )}
                {activeTab === 'payments' && (
                  <PaymentsTab 
                    orders={orders} 
                    settings={{ supplierId: user?.id, commissionRate, payoutStatuses }}
                  />
                )}
                {activeTab === 'account' && (
                  <AccountTab 
                    profileForm={profileForm} 
                    setProfileForm={setProfileForm} 
                    handleUpdateProfile={handleUpdateProfile} 
                    handleLogout={handleLogout}
                  />
                )}
                {activeTab === 'help' && (
                  <HelpTab />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <ProductSheet 
        isOpen={isAddProductOpen} 
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
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
