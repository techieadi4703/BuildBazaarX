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
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

import { premiumProducts, otherProducts, allProducts as rawMaterialsData, Product, categories, getProductImage, woodPlanksImg } from "@/lib/rawMaterialsData";
import { cdnImg } from "@/lib/cdnImages";
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

      <PageHeader title="Raw Materials" crumb="Raw Materials" />
      <div className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen font-body w-full pb-20 relative">
        <main className="max-w-[1920px] mx-auto flex flex-col md:flex-row min-h-screen relative">
          {/* Mobile Top Navigation (Search + Button) */}
          <div className="md:hidden flex flex-col px-4 pt-4 pb-2 bg-[var(--bg-base)] space-y-4 sticky top-0 z-20 shadow-sm border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4" />
              <input
                className="w-full px-4 h-11 sm:h-14 rounded-2xl bg-background border border-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-[var(--text-tertiary)] outline-none"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
            </div>
            <button
              onClick={openFilterSheet}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-sm font-medium whitespace-nowrap hover:bg-[var(--bg-surface)] transition-colors shadow-sm font-body"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Active filter pills */}
          {selectedCategory && (
            <div className="flex flex-wrap gap-2 pt-1 pb-1">
              <span className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 font-body">
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
          className="md:hidden fixed bottom-24 right-6 z-30 bg-[var(--accent-warm)] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <Sliders className="w-6 h-6" />
        </button>

        {/* Desktop Sidebar Filter */}
        <aside className="hidden w-80 px-4 py-8 pt-6 md:px-5 md:flex flex-col gap-4 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] shrink-0 sticky top-0 h-auto">
          <div className="flex flex-col gap-6 md:gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline italic text-2xl">Filters</h2>
              {(selectedCategory !== null || searchQuery !== "") && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery("");
                  }}
                  className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--accent-warm)]"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="relative w-full md:w-[85%]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4" />
              <input
                className="w-full px-4 h-11 sm:h-14 rounded-2xl bg-background border border-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-[var(--text-tertiary)] outline-none"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
            </div>
          </div>

          <div className="space-y-4 md:space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)] opacity-60">Categories</h3>
            <div className="flex flex-col gap-3 md:gap-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="desktopCategory"
                  checked={selectedCategory === null}
                  onChange={() => setSelectedCategory(null)}
                  className="w-4 h-4 text-[var(--accent-warm)] border-[var(--border-default)] focus:ring-[#735c00] bg-transparent"
                />
                <span className={`text-sm font-medium transition-colors ${selectedCategory === null ? 'text-[var(--accent-warm)]' : 'group-hover:text-[var(--accent-warm)]'}`}>
                  All Materials
                </span>
              </label>
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="desktopCategory"
                      checked={selectedCategory === cat.id}
                      onChange={() => setSelectedCategory(cat.id)}
                      className="w-4 h-4 text-[var(--accent-warm)] border-[var(--border-default)] focus:ring-[#735c00] bg-transparent"
                    />
                    <Icon className={`w-4 h-4 transition-colors ${selectedCategory === cat.id ? 'text-[var(--accent-warm)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--accent-warm)]'}`} />
                    <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'text-[var(--accent-warm)]' : 'group-hover:text-[var(--accent-warm)]'}`}>
                      {cat.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Featured Ad inside Sidebar */}
          <div className="mt-8 p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg">
            <h5 className="font-bold mb-3 font-headline italic text-lg">
              Featured Material
            </h5>
            <img
              src={cdnImg(woodPlanksImg, 400)}
              alt="Veneer"
              loading="lazy"
              width={400}
              height={400}
              decoding="async"
              className="w-full aspect-square object-cover rounded mb-4"
            />
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed font-body">
              Discover the 2024 Architectural Digest choice for
              sustainable veneers.
            </p>
            <a
              href="#"
              className="font-body text-[10px] font-bold uppercase text-[var(--accent-warm)] flex items-center gap-1 hover:underline"
            >
              Read Monograph <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </aside>

        {/* Content Canvas */}
        <section className="flex-1 p-0 md:p-8 lg:px-8 xl:px-16 md:pt-8 md:pb-4 bg-[var(--bg-base)]">
          {/* Header - Hidden on mobile, handled by mobile top bar */}
          <header className="hidden md:block mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h1 className="font-display font-semibold text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] tracking-tight text-[var(--text-primary)] mb-6 whitespace-nowrap">
                  Raw Materials
                </h1>
              </div>
              <div className="flex shrink-0">
                <span className="px-5 py-2.5 bg-[var(--bg-surface)] rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-warm)]"></span>
                  {totalCount} MATERIALS AVAILABLE
                </span>
              </div>
            </div>
          </header>
              <AnimatePresence mode="wait">
                {isLoadingReq || isLoadingSup ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center p-24 text-center"
                  >
                    <div className="w-10 h-10 animate-spin rounded-full border-4 border-[var(--accent-warm)] border-t-transparent mb-4"></div>
                    <p className="font-body text-sm text-[var(--text-tertiary)]">
                      Loading materials inventory...
                    </p>
                  </motion.div>
                ) : filteredProducts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center p-20 text-center border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-card)]"
                  >
                    <span className="font-headline text-2xl italic mb-2 text-[var(--text-primary)]">
                      No Elements Active
                    </span>
                    <p className="font-body text-sm text-[var(--text-tertiary)]">
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
                        className="group flex flex-col h-full bg-[var(--bg-card)] rounded-lg md:rounded-2xl overflow-hidden shadow-sm border border-[var(--border-subtle)] hover:shadow-md transition-all relative"
                      >
                        <Link to={`/materials/${product.id}`} className="flex flex-col h-full">
                        {/* Image Box */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg-card)]">
                          <img
                            src={cdnImg(getProductImage(product), 400)}
                            alt={product.brand || "Material"}
                            loading="lazy"
                            width={400}
                            height={500}
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
                            <span className="bg-[var(--bg-surface)] backdrop-blur-md px-2 py-1 shadow-md border-[var(--border-default)] rounded-full text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm border border-[var(--border-subtle)] text-[var(--text-primary)]">
                              <BadgeCheck
                                className={`w-3 h-3 ${product.in_stock ? "text-[var(--accent-warm)]" : "text-orange-500"} shrink-0`}
                              />
                              <span>
                                {product.in_stock ? "Verified" : "Limited"}
                              </span>
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-10">
                            <span className="bg-[var(--accent-warm)] text-white px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-sm shadow-md">
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
                                    className="bg-[var(--accent)] text-white rounded-full flex items-center gap-1 py-[2px] shadow-[var(--shadow-md)] border border-[var(--border-subtle)]"
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
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--accent-hover)] transition-all"
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
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--accent-hover)] transition-all"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </motion.div>
                                );
                              }
                              return (
                                <button
                                  onClick={(e) => handleAddToCart(e, product)}
                                  className="w-8 h-8 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:bg-[var(--accent-hover)] hover:scale-110 transition-all shadow-[var(--shadow-md)]"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-3 md:p-4 flex flex-col flex-grow">
                          <h3 className="text-sm md:text-base font-headline font-bold leading-tight text-[var(--text-primary)] mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex justify-between items-end mt-auto pt-2">
                            <span className="text-[10px] text-[var(--text-tertiary)] font-body lowercase line-clamp-1 mr-2">
                              {product.category?.replace("-", " ")}
                            </span>
                            <span className="font-body font-bold text-[var(--text-primary)] text-sm whitespace-nowrap price-display">₹{product.price?.toLocaleString() || "0"}
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
                <div className="mt-8 flex flex-col items-center gap-3">
                  {/* Flipkart Info Label */}
                  <div className="text-xs text-[var(--text-tertiary)] font-body">
                    Showing page <span className="font-bold text-[var(--text-primary)]">{page}</span> of <span className="font-bold text-[var(--text-primary)]">{totalPages}</span> ({totalCount} total items)
                  </div>
                  
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-[var(--border-subtle)] rounded-lg disabled:opacity-40 hover:bg-[var(--bg-card)] text-sm font-semibold transition-colors disabled:cursor-not-allowed text-[var(--text-primary)]"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                      {getPaginationRange(page, totalPages).map((p, idx) => {
                        if (p === "...") {
                          return (
                            <span key={`ell-${idx}`} className="px-2 text-[var(--text-tertiary)] text-sm font-bold">
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={`page-${p}`}
                            onClick={() => setPage(Number(p))}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold border transition-all ${
                              page === p
                                ? "bg-[var(--accent-warm)] text-white border-[var(--accent-warm)] shadow-sm font-bold"
                                : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--bg-card)]"
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
                      className="px-4 py-2 border border-[var(--border-subtle)] rounded-lg disabled:opacity-40 hover:bg-[var(--bg-card)] text-sm font-semibold transition-colors disabled:cursor-not-allowed text-[var(--text-primary)]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

        </section>

        {/* Mobile Bottom Sheet for Filters */}
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetContent
              className="overflow-y-auto w-full md:hidden bg-[var(--bg-base)] z-[100] px-6 rounded-t-3xl border-0 shadow-2xl"
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
                  <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="draftCategory"
                      checked={draftCategory === null}
                      onChange={() => setDraftCategory(null)}
                      className="w-4 h-4 text-[var(--accent-warm)] border-[var(--border-default)] focus:ring-[#735c00] bg-transparent"
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${draftCategory === null ? "text-[var(--accent-warm)]" : "text-[var(--text-secondary)]"}`}
                    >
                      All Materials
                    </span>
                  </label>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                      >
                        <input
                          type="radio"
                          name="draftCategory"
                          checked={draftCategory === cat.id}
                          onChange={() => setDraftCategory(cat.id)}
                          className="w-4 h-4 text-[var(--accent-warm)] border-[var(--border-default)] focus:ring-[#735c00] bg-transparent"
                        />
                        <Icon
                          className={`w-4 h-4 ${draftCategory === cat.id ? "text-[var(--accent-warm)]" : "text-[var(--text-tertiary)]"}`}
                        />
                        <span
                          className={`text-sm font-medium transition-colors ${draftCategory === cat.id ? "text-[var(--accent-warm)]" : "text-[var(--text-secondary)]"}`}
                        >
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-6 bg-background backdrop-blur-md border-t border-[var(--border-subtle)] flex gap-4 pb-12">
                <button
                  onClick={resetFilters}
                  className="w-1/3 py-4 border border-[var(--border-subtle)] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--bg-base)] bg-[var(--bg-card)] transition-colors font-body"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-4 bg-[var(--accent)] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--accent-hover)] transition-colors shadow-xl font-body"
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
