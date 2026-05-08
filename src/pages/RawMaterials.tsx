import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Plus,
  Minus,
  Zap,
  ArrowUpRight,
  SlidersHorizontal,
  Sliders,
  X,
  BadgeCheck,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

import { premiumProducts, otherProducts, allProducts as rawMaterialsData, Product, categories, getProductImage, woodPlanksImg } from "@/lib/rawMaterialsData";
import { Link } from "react-router-dom";

const allProductsList: Product[] = rawMaterialsData;


const RawMaterials = () => {
  const { toast } = useToast();
  const { addToCart, items: cartItems, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryFromUrl,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [expandedMobileDropdown, setExpandedMobileDropdown] = useState<
    string | null
  >(null);
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
    setExpandedMobileDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const { data: regularProducts = [], isLoading: isLoadingReq } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Shuffle products randomly on load
      return [...allProductsList].sort(() => Math.random() - 0.5);
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: supplierProducts = [], isLoading: isLoadingSup } = useQuery({
    queryKey: ["supplier-products"],
    queryFn: async () => {
      // Removed supplier raw materials for now as requested
      return [] as Product[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const allProducts: Product[] = [...regularProducts, ...supplierProducts];
  const filteredProducts = allProducts.filter((product) => {
    const matchCat = !selectedCategory || product.category === selectedCategory;
    const matchSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const added = addToCart({
      id: product.id,
      supplier_id: product.supplier_id,
      name: product.name ?? "Raw Material",
      brand: product.brand ?? "Unknown",
      image: product.image_url ?? "",
      price: product.price ?? 0,
      originalPrice: product.price ?? 0,
      specs: product.specs ?? "",
    });
    if (added) {
      toast({
        title: "Module Added",
        description: `${product.name} initialized in cart.`,
      });
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
        <title>
          Buy Raw Materials Online | BuildBazaarX – Cement, Tiles, Wood & More
        </title>
        <meta
          name="description"
          content="Source premium construction raw materials at BuildBazaarX. Shop cement, tiles, plywood, paints, plumbing, electrical & hardware from verified suppliers. Direct to site delivery across India."
        />
        <link rel="canonical" href="https://buildbazaarx.com/raw-materials" />
        <meta
          property="og:url"
          content="https://buildbazaarx.com/raw-materials"
        />
        <meta
          property="og:title"
          content="Buy Raw Materials Online | BuildBazaarX"
        />
        <meta
          property="og:description"
          content="Shop premium construction raw materials from verified Indian suppliers. Cement, tiles, wood, paints & more — delivered direct to site."
        />
        <meta
          property="og:image"
          content="https://buildbazaarx.com/og-image.png"
        />
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
                {categories.find((c) => c.id === selectedCategory)?.name ||
                  selectedCategory}
                <X
                  className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                  onClick={() => setSelectedCategory(null)}
                />
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
                <span className="font-body text-[10px] uppercase tracking-widest text-[#74777d]">
                  Current Inventory
                </span>
                <span className="text-2xl font-headline font-medium">
                  {allProducts.length} Items
                </span>
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
                  <h4 className="font-body text-[10px] uppercase tracking-[0.2em] text-[#74777d] font-bold">
                    Categories
                  </h4>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-[10px] text-[#74777d] border-b border-[#74777d] pb-[1px] hover:text-black"
                    >
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
                          className={`flex items-center justify-between w-full group relative py-1 ${selectedCategory === cat.id ? "text-[#735c00]" : "text-[#1c1c1a]"}`}
                        >
                          <div className="flex items-center gap-3 relative z-10">
                            <Icon
                              className={`w-4 h-4 transition-colors ${selectedCategory === cat.id ? "text-[#735c00]" : "text-[#74777d] group-hover:text-[#735c00]"}`}
                            />
                            <span
                              className={`font-headline text-xl italic group-hover:text-[#735c00] transition-colors`}
                            >
                              {cat.name}
                            </span>
                          </div>
                          {selectedCategory === cat.id && (
                            <motion.div
                              layoutId="active-category-underline"
                              className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#735c00] z-0"
                              transition={{
                                type: "spring",
                                bounce: 0.2,
                                duration: 0.6,
                              }}
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Featured Ad inside Sidebar */}
                <div className="mt-16 p-6 bg-[#f6f3f0] rounded-lg">
                  <h5 className="font-bold mb-3 font-headline italic text-lg">
                    Featured Material
                  </h5>
                  <img
                    src={woodPlanksImg}
                    alt="Veneer"
                    className="w-full aspect-square object-cover rounded mb-4 mix-blend-multiply"
                  />
                  <p className="text-xs text-[#44474c] mb-4 leading-relaxed font-body">
                    Discover the 2024 Architectural Digest choice for
                    sustainable veneers.
                  </p>
                  <a
                    href="#"
                    className="font-body text-[10px] font-bold uppercase text-[#735c00] flex items-center gap-1 hover:underline"
                  >
                    Read Monograph <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </aside>

            {/* Catalog Grid */}
            <div className="flex-grow">
              <AnimatePresence mode="wait">
                {isLoadingReq || isLoadingSup ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center p-24 text-center"
                  >
                    <div className="w-10 h-10 animate-spin rounded-full border-4 border-[#735c00] border-t-transparent mb-4"></div>
                    <p className="font-body text-sm text-[#74777d]">
                      Loading materials inventory...
                    </p>
                  </motion.div>
                ) : filteredProducts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center p-20 text-center border border-[#e5e2df] rounded-lg bg-[#f6f3f0]"
                  >
                    <span className="font-headline text-2xl italic mb-2 text-[#1c1c1a]">
                      No Elements Active
                    </span>
                    <p className="font-body text-sm text-[#74777d]">
                      Shift curation filters to uncover available components.
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0">
                    {filteredProducts.map((product) => (
                      <motion.article
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex flex-col h-full bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-[#e5e2df] hover:shadow-md transition-all relative"
                      >
                        <Link to={`/materials/${product.id}`} className="flex flex-col h-full">
                        {/* Image Box */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#f6f3f0]">
                          <img
                            src={getProductImage(product)}
                            alt={product.brand || "Material"}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
                            <span className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm border border-[#e5e2df] text-[#1c1c1a]">
                              <BadgeCheck
                                className={`w-3 h-3 ${product.in_stock ? "text-[#735c00]" : "text-orange-500"} shrink-0`}
                              />
                              <span>
                                {product.in_stock ? "Verified" : "Limited"}
                              </span>
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-10">
                            <span className="bg-[#735c00] text-white px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-sm shadow-md">
                              {product.category?.toUpperCase() || "MATERIAL"}
                            </span>
                          </div>

                          {/* Hover FAB - Add to Cart / Quantity Controller */}
                          <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-20">
                            {(() => {
                              const cartItem = cartItems.find(
                                (i) => i.id === product.id,
                              );
                              if (cartItem) {
                                return (
                                  <motion.div
                                    layout
                                    className="bg-[#1c1c1a] text-white rounded-full flex items-center gap-1 py-[2px] shadow-lg border border-white/10"
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateQuantity(
                                          product.id,
                                          cartItem.quantity - 1,
                                        );
                                      }}
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#735c00] transition-all"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest min-w-[8px] text-center">
                                      {cartItem.quantity}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateQuantity(
                                          product.id,
                                          cartItem.quantity + 1,
                                        );
                                      }}
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#735c00] transition-all"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </motion.div>
                                );
                              }
                              return (
                                <button
                                  onClick={(e) => handleAddToCart(e, product)}
                                  className="w-8 h-8 bg-[#1c1c1a] text-white rounded-full flex items-center justify-center hover:bg-[#735c00] hover:scale-110 transition-all shadow-lg"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-3 md:p-4 flex flex-col flex-grow">
                          <h3 className="text-sm md:text-base font-headline font-bold leading-tight text-[#1c1c1a] mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex justify-between items-end mt-auto pt-2">
                            <span className="text-[10px] text-[#74777d] font-body lowercase line-clamp-1 mr-2">
                              {product.category?.replace("-", " ")}
                            </span>
                            <span className="font-body font-bold text-[#1c1c1a] text-sm whitespace-nowrap">
                              ₹{product.price?.toLocaleString() || "0"}
                            </span>
                          </div>
                          </div>
                        </Link>
                      </motion.article>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Bottom Sheet for Filters */}
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetContent
              className="overflow-y-auto w-full md:hidden bg-[#fcf9f6] z-[100] px-6 rounded-t-3xl border-0 shadow-2xl"
              side="bottom"
            >
              <SheetHeader className="mb-6 pb-2 block">
                <SheetTitle className="font-headline text-2xl text-left bg-gradient-to-r from-[#1c1c1a] to-[#735c00] bg-clip-text text-transparent">
                  Material Filters
                </SheetTitle>
                <SheetDescription className="hidden">
                  Filter options to refine the catalog of premium raw materials.
                </SheetDescription>
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
                    <span
                      className={`text-sm font-medium transition-colors ${draftCategory === null ? "text-[#735c00]" : "text-[#44474c]"}`}
                    >
                      All Materials
                    </span>
                  </label>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <input
                          type="radio"
                          name="draftCategory"
                          checked={draftCategory === cat.id}
                          onChange={() => setDraftCategory(cat.id)}
                          className="w-4 h-4 text-[#735c00] border-[#c4c6cc] focus:ring-[#735c00] bg-transparent"
                        />
                        <Icon
                          className={`w-4 h-4 ${draftCategory === cat.id ? "text-[#735c00]" : "text-[#74777d]"}`}
                        />
                        <span
                          className={`text-sm font-medium transition-colors ${draftCategory === cat.id ? "text-[#735c00]" : "text-[#44474c]"}`}
                        >
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e5e2df] flex gap-4 pb-12">
                <button
                  onClick={resetFilters}
                  className="w-1/3 py-4 border border-[#e5e2df] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#fcf9f6] bg-white transition-colors font-body"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-4 bg-[#1c1c1a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#735c00] transition-colors shadow-xl font-body"
                >
                  Apply Filters
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </main>
      </div>
    </Layout>
  );
};

export default RawMaterials;
