import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, ShoppingCart, Info, SlidersHorizontal, Sliders, X, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Placeholder images for categories
import cementImg from "@/assets/cement-bag.png";
import plywoodImg from "@/assets/plywood-sheets.png";
import tilesImg from "@/assets/floor-tiles.png";
import paintImg from "@/assets/paint-buckets.png";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  original_price: number;
  discount: number;
  rating: number;
  reviews: number;
  specs: string;
  in_stock: boolean;
  image_url: string | null;
}

const categories = [
  { id: "cement", name: "Cement & Steel", icon: "🏗️" },
  { id: "wood", name: "Plywood & Timber", icon: "🪵" },
  { id: "tiles", name: "Tiles & Marble", icon: "💎" },
  { id: "paints", name: "Paints & Finishes", icon: "🎨" },
  { id: "plumbing", name: "Plumbing & Bath", icon: "🚿" },
  { id: "electrical", name: "Electrical & Lighting", icon: "💡" },
];

const RawMaterials = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const openFilterSheet = () => setIsFilterSheetOpen(true);
  const closeFilterSheet = () => setIsFilterSheetOpen(false);

  const getProductImage = (product: Product) => {
    if (product.image_url) return product.image_url;
    switch(product.category) {
      case 'cement': return cementImg;
      case 'wood': return plywoodImg;
      case 'tiles': return tilesImg;
      case 'paints': return paintImg;
      default: return plywoodImg;
    }
  };

  const { data: regularProducts = [], isLoading: isLoadingReq } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data as Product[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: supplierProducts = [], isLoading: isLoadingSup } = useQuery({
    queryKey: ["supplier-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_products')
        .select(`*, suppliers(business_name)`)
        .eq('is_published', true);
      if (error) throw error;
      return (data || []).map((sp: any) => ({
        id: sp.id,
        name: sp.name,
        brand: sp.suppliers?.business_name || "Verified Supplier",
        category: sp.category,
        price: sp.price,
        original_price: sp.price,
        discount: 0,
        rating: 4.5,
        reviews: 10,
        specs: sp.description,
        in_stock: sp.stock_quantity > 0,
        image_url: sp.image_url,
      })) as Product[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const mockMaterials: Product[] = [
    {
      id: 101,
      name: "Premium Marine Plywood",
      brand: "CenturyPly",
      category: "wood",
      price: 185,
      original_price: 210,
      discount: 12,
      rating: 4.8,
      reviews: 156,
      specs: "19mm • BWP Grade",
      in_stock: true,
      image_url: plywoodImg
    },
    {
      id: 102,
      name: "Luxury Silk Emulsion",
      brand: "Asian Paints",
      category: "paints",
      price: 450,
      original_price: 520,
      discount: 15,
      rating: 4.9,
      reviews: 284,
      specs: "10L • Royale Glitz",
      in_stock: true,
      image_url: paintImg
    },
    {
      id: 103,
      name: "Italian Marble Tiles",
      brand: "Kajaria",
      category: "tiles",
      price: 85,
      original_price: 110,
      discount: 22,
      rating: 4.7,
      reviews: 92,
      specs: "600x600mm • Vitrified",
      in_stock: true,
      image_url: tilesImg
    },
    {
      id: 104,
      name: "OPC 53 Grade Cement",
      brand: "UltraTech",
      category: "construction",
      price: 420,
      original_price: 440,
      discount: 5,
      rating: 4.9,
      reviews: 540,
      specs: "50kg Bag",
      in_stock: true,
      image_url: cementImg
    }
  ];

  const allProducts = useMemo(() => {
    const combined = [...regularProducts, ...supplierProducts];
    return combined.length > 0 ? combined : mockMaterials;
  }, [regularProducts, supplierProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchCat = !selectedCategory || product.category === selectedCategory;
      const matchSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const added = addToCart({
      id: product.id,
      name: product.name ?? "Raw Material",
      brand: product.brand ?? "Premium Brand",
      image: getProductImage(product),
      price: product.price ?? 0,
      originalPrice: product.original_price ?? 0,
      specs: product.specs ?? "",
    });
    if (added) {
      toast({ title: "Module Added", description: `${product.name} initialized in cart.` });
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in as a customer to add items to your cart.",
      });
      navigate("/auth?mode=login");
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Buy Raw Materials Online | BuildBazaarX – Cement, Tiles, Wood & More</title>
        <meta name="description" content="Source premium construction raw materials at BuildBazaarX. Shop cement, tiles, plywood, paints, plumbing, electrical & hardware from verified suppliers. Direct to site delivery across India." />
        <link rel="canonical" href="https://buildbazaarx.com/raw-materials" />
        <meta property="og:url" content="https://buildbazaarx.com/raw-materials" />
        <meta property="og:title" content="Buy Raw Materials Online | BuildBazaarX" />
        <meta property="og:description" content="Shop premium construction raw materials from verified Indian suppliers. Cement, tiles, wood, paints & more — delivered direct to site." />
        <meta property="og:image" content="https://buildbazaarx.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Helmet>
      
      <div className="bg-[#fcf9f6] text-[#1c1c1a] min-h-screen font-body w-full pb-20 relative">
        
        {/* Mobile Top Navigation (Search + Button) */}
        <div className="md:hidden flex flex-col px-4 pt-4 pb-2 bg-[#fcf9f6] space-y-4 sticky top-0 z-20 shadow-sm border-b border-[#e5e2df]">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] w-4 h-4" />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e2df] focus:border-[#735c00] rounded-xl text-sm outline-none shadow-sm font-body" 
                placeholder="Search materials..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
            </div>
            <button 
              onClick={openFilterSheet}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#f6f3f0] border border-[#e5e2df] rounded-xl text-sm font-medium whitespace-nowrap hover:bg-[#eae8e5] transition-colors shadow-sm font-body"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
          </div>
          
          {/* Active filter pills */}
          {selectedCategory && (
            <div className="flex flex-wrap gap-2 pt-1 pb-1">
              <span className="bg-[#f6f3f0] border border-[#e5e2df] text-[#1c1c1a] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 font-body">
                {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                <X className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setSelectedCategory(null)} />
              </span>
            </div>
          )}
        </div>

        {/* Floating Action Button for Mobile */}
        <button 
          onClick={openFilterSheet}
          className="md:hidden fixed bottom-24 right-6 z-30 bg-[#735c00] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <Sliders className="w-6 h-6" />
        </button>

        <main className="max-w-[1440px] mx-auto px-4 md:px-12 py-0 md:py-20">
          
          {/* Header */}
          <header className="hidden md:flex mb-16 md:mb-24 flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-6xl md:text-8xl font-headline font-bold tracking-tight leading-none mb-6">
                Raw <span className="italic font-normal">Materials</span>
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="font-body text-[10px] uppercase tracking-widest text-[#74777d]">Current Inventory</span>
                <span className="text-2xl font-headline font-medium">{allProducts.length} Items</span>
              </div>
              <div className="w-12 h-[1px] bg-[#c4c6cc] opacity-50"></div>
            </div>
            {/* Search Input inline with header */}
            <div className="hidden md:block relative w-full md:w-64 -mt-4 md:mt-0">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#74777d] w-4 h-4" />
               <input 
                 className="pl-12 pr-4 py-3 bg-[#f6f3f0] border-none focus:ring-1 focus:ring-[#735c00] rounded-full text-sm w-full outline-none font-body shadow-inner" 
                 placeholder="Search materials..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 type="text"
               />
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-12 mt-4 md:mt-12">
            
            {/* Sidebar Categories */}
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <div className="sticky top-32">
                <div className="mb-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#74777d] mb-6">Inventory Grid</h3>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className={`flex items-center justify-between px-5 py-4 rounded-xl text-sm font-medium transition-all ${!selectedCategory ? 'bg-[#735c00] text-white shadow-lg' : 'bg-white hover:bg-[#f6f3f0] text-[#44474c]'}`}
                    >
                      <span>Full Catalog</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${!selectedCategory ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} />
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center justify-between px-5 py-4 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.id ? 'bg-[#735c00] text-white shadow-lg' : 'bg-white hover:bg-[#f6f3f0] text-[#44474c]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${selectedCategory === cat.id ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1c1c1a] rounded-[2rem] p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
                  <div className="relative z-10">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#735c00]">Market Update</span>
                    <h4 className="text-xl font-bold mt-2 mb-4 leading-tight">Institutional Steel Rates</h4>
                    <p className="text-[11px] text-[#74777d] leading-relaxed mb-6">Real-time procurement data from primary manufacturers across India.</p>
                    <button className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/btn">
                      View Indices <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
               {isLoadingReq || isLoadingSup ? (
                 <div className="h-[40vh] flex flex-col items-center justify-center gap-6">
                    <div className="w-10 h-10 border-2 border-[#735c00]/20 border-t-[#735c00] rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c4c6cc]">Scanning structural inventory...</span>
                 </div>
               ) : filteredProducts.length === 0 ? (
                 <div className="h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white border border-[#e5e2df] rounded-[3rem]">
                    <div className="w-16 h-16 bg-[#f6f3f0] rounded-2xl flex items-center justify-center mb-6">
                      <X className="w-8 h-8 text-[#c4c6cc]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No Matches Found</h3>
                    <p className="text-[#74777d] max-w-xs mx-auto mb-8">Shift procurement parameters to uncover available materials.</p>
                    <button 
                      onClick={() => {setSelectedCategory(null); setSearchQuery("");}}
                      className="px-8 py-4 bg-[#1c1c1a] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#735c00] transition-colors"
                    >
                      Reset Inventory Curation
                    </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                   <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, idx) => (
                      <motion.div
                        layout
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group"
                      >
                        <article className="bg-white rounded-[2.5rem] p-4 border border-black/5 hover:border-[#735c00]/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] h-full flex flex-col">
                          <div className="relative aspect-[4/3] rounded-[1.8rem] overflow-hidden mb-6">
                            <img 
                              src={getProductImage(product)} 
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            
                            {/* Stock Badge */}
                            <div className="absolute top-4 left-4">
                              {product.in_stock ? (
                                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-[9px] font-bold uppercase tracking-widest">In Stock</span>
                                </div>
                              ) : (
                                <div className="bg-red-50/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-100 text-red-600">
                                  <span className="text-[9px] font-bold uppercase tracking-widest">Unavailable</span>
                                </div>
                              )}
                            </div>

                            {/* Cart Action */}
                            <button 
                              onClick={(e) => handleAddToCart(e, product)}
                              className="absolute bottom-4 right-4 w-12 h-12 bg-[#1c1c1a] text-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#735c00]"
                            >
                              <ShoppingCart className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="px-3 pb-4 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#735c00]">{product.brand}</span>
                              <div className="flex items-center gap-1 text-[#74777d]">
                                <Star className="w-3 h-3 fill-[#735c00] text-[#735c00]" />
                                <span className="text-[10px] font-bold">{product.rating}</span>
                              </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-[#1c1c1a] mb-2 leading-tight group-hover:text-[#735c00] transition-colors">{product.name}</h3>
                            <p className="text-[11px] text-[#74777d] font-medium mb-6 line-clamp-1">{product.specs}</p>
                            
                            <div className="mt-auto pt-6 border-t border-[#f6f3f0] flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-[#1c1c1a]">₹{product.price.toLocaleString('en-IN')}</span>
                                {product.original_price > product.price && (
                                  <span className="text-[10px] text-[#c4c6cc] line-through">₹{product.original_price.toLocaleString('en-IN')}</span>
                                )}
                              </div>
                              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#735c00] hover:translate-x-1 transition-transform">
                                Specifications <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </article>
                      </motion.div>
                    ))}
                   </AnimatePresence>
                 </div>
               )}
            </div>
          </div>
        </main>

        {/* Mobile Filter Sheet */}
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
           <SheetContent side="bottom" className="h-[80vh] rounded-t-[3rem] bg-[#fcf9f6] border-none px-6 pb-12 overflow-y-auto">
             <SheetHeader className="mb-10 text-left pt-2">
               <SheetTitle className="text-3xl font-bold tracking-tighter">Inventory curation</SheetTitle>
               <SheetDescription className="text-xs uppercase tracking-widest text-[#74777d] font-bold">Refine structural supply chain</SheetDescription>
             </SheetHeader>
             
             <div className="space-y-10">
                <div className="space-y-6">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c4c6cc]">Product Spheres</h4>
                   <div className="grid grid-cols-2 gap-3">
                     <button 
                        onClick={() => {setSelectedCategory(null); closeFilterSheet();}}
                        className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${!selectedCategory ? 'bg-[#1c1c1a] border-[#1c1c1a] text-white shadow-xl' : 'bg-white border-[#e5e2df] text-[#44474c]'}`}
                     >
                       <span>📋</span>
                       <span>All Materials</span>
                     </button>
                     {categories.map(cat => (
                       <button 
                         key={cat.id}
                         onClick={() => {setSelectedCategory(cat.id); closeFilterSheet();}}
                         className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${selectedCategory === cat.id ? 'bg-[#1c1c1a] border-[#1c1c1a] text-white shadow-xl' : 'bg-white border-[#e5e2df] text-[#44474c]'}`}
                       >
                         <span>{cat.icon}</span>
                         <span>{cat.name}</span>
                       </button>
                     ))}
                   </div>
                </div>

                <div className="p-8 bg-[#f6f3f0] rounded-[2rem] border border-[#e5e2df] relative overflow-hidden">
                   <CheckCircle2 className="absolute top-[-10px] right-[-10px] w-24 h-24 text-black/[0.03]" />
                   <h5 className="text-sm font-bold mb-2">BuildBazaarX Assurance</h5>
                   <p className="text-[11px] text-[#74777d] leading-relaxed">Every structural element listed is vetted for ASTM/IS standards and origin-certified.</p>
                </div>
             </div>
           </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
};

export default RawMaterials;
