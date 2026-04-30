import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Minus, Zap, ArrowUpRight, SlidersHorizontal, Sliders, ChevronDown, X, Heart, Hammer, Droplets, HardHat, Grid3X3, Settings, Pipette } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// Fallback images
import plywoodImg from "@/assets/products/plywood.jpg";
import paintImg from "@/assets/products/paint.jpg";
import tilesImg from "@/assets/products/tiles.jpg";
import ledLightImg from "@/assets/products/led-light.jpg";
import showerImg from "@/assets/products/shower.jpg";
import cementImg from "@/assets/products/cement.jpg";
import laminateImg from "@/assets/products/laminate.jpg";
import switchesImg from "@/assets/products/switches.jpg";

const categoryFallbackImages: Record<string, string> = {
  wood: plywoodImg,
  paints: paintImg,
  tiles: tilesImg,
  electrical: ledLightImg,
  plumbing: showerImg,
  construction: cementImg,
  hardware: laminateImg,
};

function getProductImage(product: { image_url: string | null; category: string | null }): string {
  if (product.image_url) return product.image_url;
  if (product.category && categoryFallbackImages[product.category]) return categoryFallbackImages[product.category];
  return plywoodImg;
}

const categories = [
  { id: "wood", name: "Wood & Boards", count: 8, icon: Hammer },
  { id: "paints", name: "Paints & Finishes", count: 24, icon: Droplets },
  { id: "construction", name: "Construction", count: 12, icon: HardHat },
  { id: "tiles", name: "Tiles & Flooring", count: 19, icon: Grid3X3 },
  { id: "hardware", name: "Hardware", count: 42, icon: Settings },
  { id: "plumbing", name: "Plumbing", count: 15, icon: Pipette },
  { id: "electrical", name: "Electrical", count: 31, icon: Zap },
];

type Product = {
  id: number;
  name: string | null;
  brand: string | null;
  category: string | null;
  price: number | null;
  original_price: number | null;
  discount: number | null;
  rating: number | null;
  reviews: number | null;
  specs: string | null;
  in_stock: boolean;
  image_url: string | null;
};

const RawMaterials = () => {
  const { toast } = useToast();
  const { addToCart, items: cartItems, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [expandedMobileDropdown, setExpandedMobileDropdown] = useState<string | null>(null);
  const [draftCategory, setDraftCategory] = useState<string | null>(null);

  useEffect(() => {
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  const openFilterSheet = () => {
    setDraftCategory(selectedCategory);
    setIsFilterSheetOpen(true);
  };

  const applyFilters = () => {
    setSelectedCategory(draftCategory);
    setIsFilterSheetOpen(false);
    setExpandedMobileDropdown(null);
  };

  const resetFilters = () => {
    setDraftCategory(null);
  };

  const toggleDropdown = (dropdown: string) => {
    setExpandedMobileDropdown(prev => prev === dropdown ? null : dropdown);
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
      return (data || []).map((dbProd: any) => ({
        id: dbProd.id,
        name: dbProd.name,
        brand: dbProd.brand || (dbProd.suppliers?.business_name),
        category: dbProd.category,
        price: dbProd.price,
        discount: dbProd.discount,
        specs: dbProd.specs,
        in_stock: dbProd.in_stock,
        image_url: dbProd.images?.[0] || null,
      })) as Product[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const allProducts = [...regularProducts, ...supplierProducts];
  const filteredProducts = allProducts.filter((product) => {
    const matchCat = !selectedCategory || product.category === selectedCategory;
    const matchSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

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
      </Helmet>
      {/* Scope Google Fonts so it overrides seamlessly */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        .font-headline { font-family: 'Newsreader', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
      `}</style>
      
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
              <h1 className="text-6xl md:text-8xl font-headline tracking-tight leading-none mb-6">
                Raw <span className="italic">Materials</span>
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

          {/* Bento Features Removed as per request */}

          <div className="flex flex-col lg:flex-row gap-12 mt-4 md:mt-12">
            
            {/* Sidebar Categories */}
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <div className="sticky top-32">
                <div className="flex justify-between items-end mb-8">
                  <h4 className="font-body text-[10px] uppercase tracking-[0.2em] text-[#74777d] font-bold">Categories</h4>
                  {selectedCategory && (
                    <button onClick={() => setSelectedCategory(null)} className="text-[10px] text-[#74777d] border-b border-[#74777d] pb-[1px] hover:text-black">
                      Clear
                    </button>
                  )}
                </div>
                <ul className="space-y-6">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <li key={cat.id}>
                        <button 
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-center justify-between w-full group relative py-1 ${selectedCategory === cat.id ? 'text-[#735c00]' : 'text-[#1c1c1a]'}`}
                        >
                          <div className="flex items-center gap-3 relative z-10">
                            <Icon className={`w-4 h-4 transition-colors ${selectedCategory === cat.id ? 'text-[#735c00]' : 'text-[#74777d] group-hover:text-[#735c00]'}`} />
                            <span className={`font-headline text-xl italic group-hover:text-[#735c00] transition-colors`}>
                              {cat.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-body text-[#74777d] font-bold opacity-60 group-hover:opacity-100 relative z-10">
                            {cat.count}
                          </span>
                          {selectedCategory === cat.id && (
                            <motion.div
                              layoutId="active-category-underline"
                              className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#735c00] z-0"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Featured Ad inside Sidebar */}
                <div className="mt-16 p-6 bg-[#f6f3f0] rounded-lg">
                  <h5 className="font-bold mb-3 font-headline italic text-lg">Featured Material</h5>
                  <img src={laminateImg} alt="Veneer" className="w-full aspect-square object-cover rounded mb-4 mix-blend-multiply" />
                  <p className="text-xs text-[#44474c] mb-4 leading-relaxed font-body">Discover the 2024 Architectural Digest choice for sustainable veneers.</p>
                  <a href="#" className="font-body text-[10px] font-bold uppercase text-[#735c00] flex items-center gap-1 hover:underline">
                    Read Monograph <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </aside>

            {/* Catalog Grid */}
            <div className="flex-grow">
              <AnimatePresence>
                {filteredProducts.length === 0 ? (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-20 text-center border border-[#e5e2df] rounded-lg bg-[#f6f3f0]">
                      <span className="font-headline text-2xl italic mb-2 text-[#1c1c1a]">No Elements Active</span>
                      <p className="font-body text-sm text-[#74777d]">Shift curation filters to uncover available components.</p>
                   </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-8">
                    {filteredProducts.map((product) => (
                      <motion.article 
                        key={product.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex flex-col h-full"
                      >
                        {/* Image Box */}
                        <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-[#f6f3f0] rounded-sm cursor-pointer border border-transparent group-hover:border-[#e5e2df] transition-all">
                          <img 
                            src={getProductImage(product)} 
                            alt={product.brand || "Material"} 
                            className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105 p-4" 
                          />
                          <div className="absolute top-4 left-4 z-10">
                            <span className="px-3 py-1 bg-white border border-[#eae8e5] text-[#1c1c1a] text-[9px] font-body font-bold uppercase tracking-widest rounded-full shadow-sm">
                              {product.in_stock ? 'In Stock' : 'Pre-Order'}
                            </span>
                          </div>
                          {/* Hover FAB - Add to Cart / Quantity Controller */}
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-20">
                            {(() => {
                              const cartItem = cartItems.find(i => i.id === product.id);
                              if (cartItem) {
                                return (
                                  <motion.div 
                                    layout
                                    className="bg-[#1c1c1a] text-white rounded-full flex items-center gap-4 p-1 shadow-lg border border-white/10"
                                  >
                                    <button 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateQuantity(product.id, cartItem.quantity - 1);
                                      }}
                                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#735c00] transition-all"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{cartItem.quantity}</span>
                                    <button 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateQuantity(product.id, cartItem.quantity + 1);
                                      }}
                                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#735c00] transition-all"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </motion.div>
                                );
                              }
                              return (
                                <button 
                                  onClick={(e) => handleAddToCart(e, product)}
                                  className="w-12 h-12 bg-[#1c1c1a] text-white rounded-full flex items-center justify-center hover:bg-[#735c00] hover:scale-110 transition-all shadow-lg"
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Title & Price */}
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h3 className="text-xl font-headline font-semibold leading-tight text-[#1c1c1a]">{product.name}</h3>
                          <span className="font-body font-medium text-[#1c1c1a] text-lg whitespace-nowrap pt-1">
                            ₹{product.price?.toLocaleString() || "0"} <span className="text-[10px] text-[#74777d] font-normal">/unit</span>
                          </span>
                        </div>

                        {/* Specs */}
                        <p className="text-sm font-body text-[#44474c] mb-6 line-clamp-2 leading-relaxed flex-grow">
                          {product.specs || "Premium structural material sourced from trusted aggregators."}
                        </p>

                        {/* Footer tags */}
                        <div className="flex items-center gap-4 mt-auto">
                          <span className="flex items-center gap-1 text-[9px] font-body font-bold uppercase tracking-tighter text-[#735c00] bg-[#f5e1ae]/30 px-2 py-1 rounded">
                            <Zap className="w-3 h-3 fill-current" /> Priority Match
                          </span>
                          <span className="text-[10px] font-body uppercase tracking-tighter text-[#74777d] italic font-medium">
                            {product.brand}
                          </span>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="mt-24 flex items-center justify-between border-t border-[#e5e2df] pt-8">
                  <button className="font-body font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 text-[#74777d] hover:text-[#735c00] transition-colors">
                    Previous Sector
                  </button>
                  <div className="flex gap-8">
                    <span className="font-headline italic text-[#735c00] text-lg">01</span>
                    <span className="font-headline italic text-[#74777d] opacity-40 text-lg">02</span>
                    <span className="font-headline italic text-[#74777d] opacity-40 text-lg">03</span>
                  </div>
                  <button className="font-body font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 text-[#1c1c1a] hover:text-[#735c00] transition-colors">
                    Next Sector 
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Bottom Sheet for Filters */}
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
             <SheetContent className="overflow-y-auto w-full md:hidden bg-[#fcf9f6] z-[100] px-6 rounded-t-3xl border-0 shadow-2xl" side="bottom">
               <SheetHeader className="mb-6 pb-2 block">
                 <SheetTitle className="font-headline text-2xl text-left bg-gradient-to-r from-[#1c1c1a] to-[#735c00] bg-clip-text text-transparent">Material Filters</SheetTitle>
                 <SheetDescription className="hidden">Filter options to refine the catalog of premium raw materials.</SheetDescription>
               </SheetHeader>
               
                <div className="space-y-4 md:space-y-3 pb-32">
                  <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                      <input 
                        type="radio" 
                        name="draftCategory"
                        checked={draftCategory === null}
                        onChange={() => setDraftCategory(null)}
                        className="w-4 h-4 text-[#735c00] border-[#c4c6cc] focus:ring-[#735c00] bg-transparent" 
                      />
                      <span className={`text-sm font-medium transition-colors ${draftCategory === null ? 'text-[#735c00]' : 'text-[#44474c]'}`}>All Materials</span>
                    </label>
                    {categories.map(cat => {
                      const Icon = cat.icon;
                      return (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                          <input 
                            type="radio" 
                            name="draftCategory"
                            checked={draftCategory === cat.id}
                            onChange={() => setDraftCategory(cat.id)}
                            className="w-4 h-4 text-[#735c00] border-[#c4c6cc] focus:ring-[#735c00] bg-transparent" 
                          />
                          <Icon className={`w-4 h-4 ${draftCategory === cat.id ? 'text-[#735c00]' : 'text-[#74777d]'}`} />
                          <span className={`text-sm font-medium transition-colors ${draftCategory === cat.id ? 'text-[#735c00]' : 'text-[#44474c]'}`}>{cat.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

               <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e5e2df] flex gap-4 pb-12">
                  <button onClick={resetFilters} className="w-1/3 py-4 border border-[#e5e2df] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#fcf9f6] bg-white transition-colors font-body">Reset</button>
                  <button onClick={applyFilters} className="flex-1 py-4 bg-[#1c1c1a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#735c00] transition-colors shadow-xl font-body">Apply Filters</button>
               </div>
             </SheetContent>
          </Sheet>
        </main>
      </div>
    </Layout>
  );
};

export default RawMaterials;
