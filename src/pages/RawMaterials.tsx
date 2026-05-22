import React, { useState, useEffect, useMemo } from "react";
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

const allProductsList: Product[] = [...rawMaterialsData].sort(() => Math.random() - 0.5);


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
  const [page, setPage] = useState(1);

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
  
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  const { data: regularProducts = [], isLoading: isLoadingReq } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      return allProductsList;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: supplierProducts = [], isLoading: isLoadingSup } = useQuery({
    queryKey: ["supplier-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_products")
        .select("*")
        .eq("is_published", true);
      
      if (error) {
        console.error("Error fetching supplier products:", error);
        return [];
      }

      // Map Supabase data to our Product interface
      return (data || []).map((p: any) => ({
        id: p.id,
        supplier_id: p.supplier_id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        original_price: p.original_price,
        discount: p.discount,
        rating: 4.5, // Default rating
        reviews: Math.floor(Math.random() * 100) + 10, // Default reviews
        specs: p.specs,
        in_stock: (p.stock_qty || 0) > 0,
        image_url: p.images && p.images.length > 0 ? p.images[0] : null,
        images: p.images || [],
        return_policy: p.return_policy,
        quality_details: p.quality_details,
        description: p.description
      })) as Product[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const allProducts = useMemo(() => {
    return [...regularProducts, ...supplierProducts];
  }, [regularProducts, supplierProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchCat = !selectedCategory || product.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 16));

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * 16;
    return filteredProducts.slice(start, start + 16);
  }, [filteredProducts, page]);

  const getPaginationRange = (current: number, total: number) => {
    const range: (number | string)[] = [];
    const delta = 2;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      } else if (i === current - delta - 1 || i === current + delta + 1) {
        range.push("...");
      }
    }
    return range.filter((item, idx, arr) => item !== "..." || arr[idx - 1] !== "...");
  };

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

      <div className="text-foreground min-h-screen font-body w-full pb-20 relative">
        {/* Mobile Top Navigation (Search + Button) */}
        <div className="md:hidden flex flex-col px-4 pt-4 pb-2 bg-transparent space-y-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-white/30 dark:bg-white/5 border border-white/40 focus:border-secondary rounded-xl text-sm outline-none backdrop-blur-md shadow-sm font-body transition-colors"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
            </div>
            <button
              onClick={openFilterSheet}
              className="flex items-center justify-center gap-2 px-5 py-3 glass rounded-xl text-sm font-medium whitespace-nowrap hover:bg-white/40 transition-colors shadow-sm font-body"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Active filter pills */}
          {selectedCategory && (
            <div className="flex flex-wrap gap-2 pt-1 pb-1">
              <span className="glass-chip text-foreground px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 font-body">
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
          className="md:hidden fixed bottom-24 right-6 z-30 bg-secondary text-secondary-foreground w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
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

            {/* Search Input inline with header */}
            <div className="hidden md:block relative w-full md:w-64 -mt-4 md:mt-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                className="pl-12 pr-4 py-3 bg-white/30 dark:bg-white/5 border border-white/40 focus:border-secondary focus:ring-1 focus:ring-secondary rounded-full text-sm w-full outline-none backdrop-blur-md font-body transition-colors"
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
                  <h4 className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                    Categories
                  </h4>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-[10px] text-muted-foreground border-b border-muted-foreground pb-[1px] hover:text-foreground"
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
                          className={`flex items-center justify-between w-full group relative py-1 ${selectedCategory === cat.id ? "text-secondary font-bold" : "text-foreground"}`}
                        >
                          <div className="flex items-center gap-3 relative z-10">
                            <Icon
                              className={`w-4 h-4 transition-colors ${selectedCategory === cat.id ? "text-secondary" : "text-muted-foreground group-hover:text-secondary"}`}
                            />
                            <span
                              className={`font-headline text-xl italic group-hover:text-secondary transition-colors`}
                            >
                              {cat.name}
                            </span>
                          </div>
                          {selectedCategory === cat.id && (
                            <motion.div
                              layoutId="active-category-underline"
                              className="absolute bottom-0 left-0 right-0 h-[2px] bg-secondary z-0"
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
                <div className="mt-16 p-6 glass-card border border-white/20">
                  <h5 className="font-bold mb-3 font-headline italic text-lg text-foreground">
                    Featured Material
                  </h5>
                  <img
                    src={woodPlanksImg}
                    alt="Veneer"
                    loading="lazy"
                    width={400}
                    height={400}
                    className="w-full aspect-square object-cover rounded mb-4 mix-blend-multiply dark:mix-blend-normal dark:opacity-80"
                  />
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed font-body">
                    Discover the 2024 Architectural Digest choice for
                    sustainable veneers.
                  </p>
                  <a
                    href="#"
                    className="font-body text-[10px] font-bold uppercase text-secondary flex items-center gap-1 hover:underline"
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
                    <div className="w-10 h-10 animate-spin rounded-full border-4 border-secondary border-t-transparent mb-4"></div>
                    <p className="font-body text-sm text-muted-foreground">
                      Loading materials inventory...
                    </p>
                  </motion.div>
                ) : filteredProducts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center p-20 text-center glass-card border border-white/20"
                  >
                    <span className="font-headline text-2xl italic mb-2 text-foreground">
                      No Elements Active
                    </span>
                    <p className="font-body text-sm text-muted-foreground">
                      Shift curation filters to uncover available components.
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0">
                    {paginatedProducts.map((product) => (
                      <motion.article
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex flex-col h-full glass-card glass-hover-lift overflow-hidden relative"
                      >
                        <Link to={`/materials/${product.id}`} className="flex flex-col h-full">
                        {/* Image Box */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-black/5 dark:bg-white/5">
                          <img
                            src={getProductImage(product)}
                            alt={product.brand || "Material"}
                            loading="lazy"
                            width={400}
                            height={500}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
                            <span className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm border border-white/20 text-foreground">
                              <BadgeCheck
                                className={`w-3 h-3 ${product.in_stock ? "text-secondary" : "text-orange-500"} shrink-0`}
                              />
                              <span>
                                {product.in_stock ? "Verified" : "Limited"}
                              </span>
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-10">
                            <span className="bg-secondary text-secondary-foreground px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-sm shadow-md">
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
                                    className="bg-primary text-primary-foreground rounded-full flex items-center gap-1 py-[2px] shadow-lg border border-white/10"
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
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-secondary transition-all"
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
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-secondary transition-all"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </motion.div>
                                );
                              }
                              return (
                                <button
                                  onClick={(e) => handleAddToCart(e, product)}
                                  className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all shadow-lg"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-3 md:p-4 flex flex-col flex-grow">
                          <h3 className="text-sm md:text-base font-headline font-bold leading-tight text-foreground mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex justify-between items-end mt-auto pt-2">
                            <span className="text-[10px] text-muted-foreground font-body lowercase line-clamp-1 mr-2">
                              {product.category?.replace("-", " ")}
                            </span>
                            <span className="font-body font-bold text-foreground text-sm whitespace-nowrap">
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-16 flex flex-col items-center gap-6">
                  {/* Flipkart Info Label */}
                  <div className="text-xs text-muted-foreground font-body">
                    Showing page <span className="font-bold text-foreground">{page}</span> of <span className="font-bold text-foreground">{totalPages}</span> ({totalCount} total items)
                  </div>
                  
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 glass rounded-lg disabled:opacity-40 hover:bg-white/20 text-sm font-semibold transition-all disabled:cursor-not-allowed text-foreground"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                      {getPaginationRange(page, totalPages).map((p, idx) => {
                        if (p === "...") {
                          return (
                            <span key={`ell-${idx}`} className="px-2 text-muted-foreground text-sm font-bold">
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={`page-${p}`}
                            onClick={() => setPage(Number(p))}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                              page === p
                                ? "bg-secondary text-secondary-foreground border-secondary shadow-sm font-bold"
                                : "glass text-foreground hover:bg-white/20"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 glass rounded-lg disabled:opacity-40 hover:bg-white/20 text-sm font-semibold transition-all disabled:cursor-not-allowed text-foreground"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Bottom Sheet for Filters */}
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetContent
              className="overflow-y-auto w-full md:hidden glass-strong z-[100] px-6 rounded-t-3xl border-0 shadow-2xl text-foreground"
              side="bottom"
            >
              <SheetHeader className="mb-6 pb-2 block">
                <SheetTitle className="font-headline text-2xl text-left bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
                  Material Filters
                </SheetTitle>
                <SheetDescription className="hidden">
                  Filter options to refine the catalog of premium raw materials.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 md:space-y-3 pb-32">
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="draftCategory"
                      checked={draftCategory === null}
                      onChange={() => setDraftCategory(null)}
                      className="w-4 h-4 text-secondary border-white/30 focus:ring-secondary bg-transparent"
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${draftCategory === null ? "text-secondary" : "text-muted-foreground"}`}
                    >
                      All Materials
                    </span>
                  </label>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <input
                          type="radio"
                          name="draftCategory"
                          checked={draftCategory === cat.id}
                          onChange={() => setDraftCategory(cat.id)}
                          className="w-4 h-4 text-secondary border-white/30 focus:ring-secondary bg-transparent"
                        />
                        <Icon
                          className={`w-4 h-4 ${draftCategory === cat.id ? "text-secondary" : "text-muted-foreground"}`}
                        />
                        <span
                          className={`text-sm font-medium transition-colors ${draftCategory === cat.id ? "text-secondary" : "text-muted-foreground"}`}
                        >
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-6 glass-strong border-t border-white/20 flex gap-4 pb-12">
                <button
                  onClick={resetFilters}
                  className="w-1/3 py-4 glass rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all font-body text-foreground"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-xl font-body"
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
