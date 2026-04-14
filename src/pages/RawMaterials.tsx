import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, Truck, Palette, Plus, Minus, Zap, ArrowUpRight } from "lucide-react";
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
  { id: "wood", name: "Wood & Boards", count: 8 },
  { id: "paints", name: "Paints & Finishes", count: 24 },
  { id: "construction", name: "Construction", count: 12 },
  { id: "tiles", name: "Tiles & Flooring", count: 19 },
  { id: "hardware", name: "Hardware", count: 42 },
  { id: "plumbing", name: "Plumbing", count: 15 },
  { id: "electrical", name: "Electrical", count: 31 },
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
  const { addToCart, items, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  const { data: regularProducts = [], isLoading: isLoadingReq } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data as Product[];
    },
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
    }
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
      navigate("/auth");
    }
  };

  return (
    <Layout>
      {/* Scope Google Fonts so it overrides seamlessly */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        .font-headline { font-family: 'Newsreader', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
      `}</style>
      
      <div className="bg-[#fcf9f6] text-[#1c1c1a] min-h-screen font-body w-full pb-20">
        <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-20">
          
          {/* Header */}
          <header className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="font-body uppercase tracking-[0.2em] text-[10px] text-[#735c00] mb-4 block font-bold">Curation No. 042</span>
              <h1 className="text-6xl md:text-8xl font-headline tracking-tight leading-none mb-6">
                Raw <span className="italic">Materials</span>
              </h1>
              <p className="text-lg md:text-xl font-body text-[#44474c] leading-relaxed opacity-80">
                A curated monograph of structural elements and finishing coats. From the core strength of premium grade steel to the chromatic precision of elite laminates.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="font-body text-[10px] uppercase tracking-widest text-[#74777d]">Current Inventory</span>
                <span className="text-2xl font-headline font-medium">{allProducts.length} Items</span>
              </div>
              <div className="w-12 h-[1px] bg-[#c4c6cc] opacity-50"></div>
            </div>
            {/* Search Input inline with header */}
            <div className="relative w-full md:w-64 -mt-4 md:mt-0">
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

          {/* Bento Features */}
          <section className="mb-16 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 p-8 bg-[#f6f3f0] rounded-xl flex flex-col justify-between group transition-all hover:bg-[#eae8e5]">
              <div className="flex justify-between items-start mb-12">
                <div className="bg-[#735c00] p-3 rounded-full text-white">
                  <Filter className="w-5 h-5" />
                </div>
                <span className="font-body text-[10px] uppercase tracking-widest text-[#735c00] font-bold">Smart Filters</span>
              </div>
              <div>
                <h3 className="text-2xl font-headline italic mb-3">Refine Selection</h3>
                <div className="flex flex-wrap gap-2 text-[#1c1c1a]">
                  <span className="px-4 py-1.5 bg-[#e5e2df] rounded-full text-[10px] uppercase tracking-wider font-bold">Premium Brands</span>
                  <span className="px-4 py-1.5 bg-[#e5e2df] rounded-full text-[10px] uppercase tracking-wider font-bold">In-Stock</span>
                  <span className="px-4 py-1.5 bg-[#e5e2df] rounded-full text-[10px] uppercase tracking-wider font-bold">Eco-Certified</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-[#0f1c2c] text-[#778598] rounded-xl flex flex-col justify-between">
              <Truck className="w-10 h-10 text-[#fed65b]" />
              <div>
                <p className="font-body text-[10px] uppercase tracking-widest mb-1 opacity-60 font-bold">Express Logistics</p>
                <h3 className="text-2xl font-headline leading-tight text-white">Priority Home <br/>Delivery</h3>
              </div>
            </div>

            <div className="p-8 bg-[#e5e2df] rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 opacity-20 transition-transform group-hover:scale-110 duration-700">
                <div className="w-full h-full bg-gradient-to-br from-[#735c00] to-transparent"></div>
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Palette className="w-10 h-10 text-[#1c1c1a]" />
                  <span className="text-[9px] font-body uppercase tracking-widest text-[#735c00] bg-white/50 px-2 py-1 rounded font-bold">Incoming Feature</span>
                </div>
                <h3 className="text-2xl font-headline text-[#1c1c1a]">Visual Search</h3>
              </div>
            </div>
          </section>

          <div className="flex flex-col lg:flex-row gap-12 mt-12">
            
            {/* Sidebar Categories */}
            <aside className="lg:w-64 flex-shrink-0">
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
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button 
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center justify-between w-full group relative py-1 ${selectedCategory === cat.id ? 'text-[#735c00]' : 'text-[#1c1c1a]'}`}
                      >
                        <span className={`font-headline text-xl italic group-hover:text-[#735c00] transition-colors relative z-10`}>
                          {cat.name}
                        </span>
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
                  ))}

                </ul>

                {/* Featured Ad inside Sidebar */}
                <div className="mt-16 p-6 bg-[#f6f3f0] rounded-lg">
                  <h5 className="text-sm font-bold mb-3 font-headline italic text-lg">Featured Material</h5>
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
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white border border-[#eae8e5] text-[#1c1c1a] text-[9px] font-body font-bold uppercase tracking-widest rounded-full shadow-sm">
                              {product.in_stock ? 'In Stock' : 'Pre-Order'}
                            </span>
                          </div>
                          {/* Hover FAB - Add to Cart / Quantity Controller */}
                          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                            {(() => {
                              const cartItem = items.find(i => i.id === product.id);
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
        </main>
      </div>
    </Layout>
  );
};

export default RawMaterials;
