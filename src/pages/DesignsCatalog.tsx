import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Heart, BadgeCheck, Clock, Compass, X, ChevronDown, SlidersHorizontal, Sliders, Plus, Minus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { kitchenImage, bedroomImage, livingroomImage, wardrobeImage, fullhomeImage, cdnImg } from "@/lib/cdnImages";

// Images

const categories = [
  { id: "all", name: "All Designs" },
  { id: "full-home", name: "Full Home" },
  { id: "kitchen", name: "Kitchen" },
  { id: "living-room", name: "Living Room" },
  { id: "bedroom", name: "Bedroom" },
  { id: "bathroom", name: "Bathroom" },
];

const styles = ["Modern", "Luxury", "Minimal", "Traditional", "Contemporary"];




const DesignsCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMobileDropdown, setExpandedMobileDropdown] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState("all");
  const [draftStyle, setDraftStyle] = useState("all");

  const { isInWishlist, addToWishlist, removeFromWishlist, isAuthenticated } = useWishlist();
  const { addToCart, items: cartItems, updateQuantity } = useCart();

  const handleWishlistToggle = (e: React.MouseEvent, design: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please log in to save designs to your wishlist");
      return;
    }

    if (isInWishlist(design.id)) {
      removeFromWishlist(design.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        id: design.id,
        name: design.name,
        image: design.image,
        category: design.category,
        style: design.style
      });
      toast.success("Added to wishlist");
    }
  };

  const handleAddToCart = (e: React.MouseEvent, design: any) => {
    e.preventDefault();
    e.stopPropagation();

    // Parse totalCost string to a number for the cart
    const numericCost = parseFloat(design.totalCost.replace(/[^\d.]/g, '')) || 0;

    const added = addToCart({
      id: design.id,
      name: design.name,
      brand: "Design Blueprint",
      image: design.image,
      price: numericCost,
      originalPrice: numericCost,
      specs: `${design.size} • ${design.time} Build • ${design.style}`,
    });

    if (added) {
      toast.success(`${design.name} blueprint added to cart.`);
    } else {
      toast.error("Please log in to add items to your cart.");
    }
  };

  const openFilterSheet = () => {
    setDraftCategory(selectedCategory);
    setDraftStyle(selectedStyle);
    setIsFilterSheetOpen(true);
  };

  const applyFilters = () => {
    setSelectedCategory(draftCategory);
    setSelectedStyle(draftStyle);
    setIsFilterSheetOpen(false);
    setExpandedMobileDropdown(null);
  };

  const resetFilters = () => {
    setDraftCategory("all");
    setDraftStyle("all");
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedStyle("all");
    setSearchQuery("");
    setDraftCategory("all");
    setDraftStyle("all");
  };

  const toggleDropdown = (dropdown: string) => {
    setExpandedMobileDropdown(prev => prev === dropdown ? null : dropdown);
  };

  React.useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedStyle, searchQuery]);

  const { data: dbDesignsData = { designs: [], totalCount: 0 }, isLoading } = useQuery({
    queryKey: ['designs', selectedCategory, selectedStyle, searchQuery, page],
    queryFn: async () => {
      let query = supabase
        .from('designs')
        .select('*, designers(full_name)', { count: 'exact' })
        .eq('is_published', true);

      if (selectedCategory !== "all") {
        const mappedCat = categories.find(c => c.id === selectedCategory)?.name;
        if (mappedCat) {
          query = query.ilike('category', mappedCat);
        }
      }

      if (selectedStyle !== "all") {
        query = query.eq('style', selectedStyle);
      }

      if (searchQuery.trim() !== "") {
        query = query.ilike('name', `%${searchQuery.trim()}%`);
      }

      const { data, count, error } = await query
        .range((page - 1) * 15, page * 15 - 1);

      if (error) {
        console.error("Error fetching designs:", error);
        return { designs: [], totalCount: 0 };
      }
      return {
        designs: data || [],
        totalCount: count || 0
      };
    },
    staleTime: 60000,
  });

  const dbDesigns = dbDesignsData.designs;
  const totalCount = dbDesignsData.totalCount;
  const totalPages = Math.max(1, Math.ceil(totalCount / 15));

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

  const allDesigns = useMemo(() => {
    const mappedDbDesigns = (dbDesigns || []).map((dbD: any) => ({
      id: `db-${dbD.id}`,
      name: dbD.name,
      category: dbD.category.toLowerCase().replace(" ", "-"),
      image: (dbD.images && dbD.images.length > 0) ? dbD.images[0] : fullhomeImage,
      size: dbD.room_size || "Standard",
      style: dbD.style,
      totalCost: `₹${(dbD.total_cost || 0).toLocaleString('en-IN')}`,
      time: "Flexible",
      featured: dbD.is_trending || false,
    }));
    return [...mappedDbDesigns];
  }, [dbDesigns]);

  const filteredDesigns = allDesigns;

  return (
    <Layout>
      <Helmet>
        <title>Home Interior Designs Catalog | BuildBazaarX</title>
        <meta name="description" content="Browse 500+ verified home interior designs on BuildBazaarX — full home, kitchen, bedroom, living room & more. Filter by style, size, and budget. Get your dream home today." />
        <link rel="canonical" href="https://buildbazaarx.com/designs" />
        <meta property="og:url" content="https://buildbazaarx.com/designs" />
        <meta property="og:title" content="Home Interior Designs Catalog | BuildBazaarX" />
        <meta property="og:description" content="Browse 500+ verified home interior design blueprints. Full home, kitchen, bedroom & more. Filter by style and budget." />
        <meta property="og:image" content="https://buildbazaarx.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Helmet>
      <div className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen font-body w-full">
        <main className="max-w-[1920px] mx-auto flex flex-col md:flex-row min-h-screen relative">

          {/* Mobile Top Navigation (Search + Button) */}
          <div className="md:hidden flex flex-col px-4 pt-4 pb-2 bg-[var(--bg-base)] space-y-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4" />
                <input
                  className="w-full px-4 h-11 sm:h-14 rounded-2xl bg-background border border-border/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-[var(--text-tertiary)] outline-none"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                />
              </div>
              <button
                onClick={openFilterSheet}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-sm font-medium whitespace-nowrap hover:bg-[var(--bg-surface)] transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <span className="text-[var(--text-tertiary)]">Showing <span className="font-bold text-[var(--text-primary)]">{filteredDesigns.length}</span> designs</span>
              <div className="flex items-center cursor-pointer font-medium text-[var(--text-primary)]">
                Newest <ChevronDown className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Active filter pills */}
            {(selectedCategory !== "all" || selectedStyle !== "all") && (
              <div className="flex flex-wrap gap-2 pt-1 pb-1">
                {selectedCategory !== "all" && (
                  <span className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <X className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setSelectedCategory('all')} />
                  </span>
                )}
                {selectedStyle !== "all" && (
                  <span className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                    {selectedStyle}
                    <X className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setSelectedStyle('all')} />
                  </span>
                )}
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
                {(selectedCategory !== "all" || selectedStyle !== "all" || searchQuery !== "") && (
                  <button
                    onClick={clearAllFilters}
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
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                />
              </div>
            </div>

            <div className="space-y-4 md:space-y-3">
              <div className="space-y-4 md:space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)] opacity-60">Room Type</h3>
                <div className="flex flex-col gap-3 md:gap-2">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="desktopCategory"
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(cat.id)}
                        className="w-4 h-4 text-[var(--accent-warm)] border-[var(--border-default)] focus:ring-[#735c00] bg-transparent"
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'text-[var(--accent-warm)]' : 'group-hover:text-[var(--accent-warm)]'}`}>
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)] opacity-60">Design Style</h3>
                <div className="flex flex-col gap-3 md:gap-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="desktopStyle"
                      checked={selectedStyle === "all"}
                      onChange={() => setSelectedStyle("all")}
                      className="w-4 h-4 text-[var(--accent-warm)] border-[var(--border-default)] focus:ring-[#735c00] bg-transparent"
                    />
                    <span className={`text-sm font-medium transition-colors ${selectedStyle === "all" ? 'text-[var(--accent-warm)]' : 'group-hover:text-[var(--accent-warm)]'}`}>
                      Any Style
                    </span>
                  </label>
                  {styles.map(style => (
                    <label key={style} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="desktopStyle"
                        checked={selectedStyle === style}
                        onChange={() => setSelectedStyle(style)}
                        className="w-4 h-4 text-[var(--accent-warm)] border-[var(--border-default)] focus:ring-[#735c00] bg-transparent"
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedStyle === style ? 'text-[var(--accent-warm)]' : 'group-hover:text-[var(--accent-warm)]'}`}>
                        {style}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Content Canvas */}
          <section className="flex-1 p-0 md:p-8 lg:px-8 xl:px-16 md:pt-8 md:pb-4 bg-[var(--bg-base)]">

            {/* Header - Hidden on mobile, handled by mobile top bar */}
            <header className="hidden md:block mb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <h1 className="font-display font-semibold text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] tracking-tight text-[var(--text-primary)] mb-6 whitespace-nowrap">
                    Designs Catalog
                  </h1>
                </div>
                <div className="flex shrink-0">
                  <span className="px-5 py-2.5 bg-[var(--bg-surface)] rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-warm)]"></span>
                    {allDesigns.length} DESIGNS AVAILABLE
                  </span>
                </div>
              </div>
            </header>

            {/* Grid */}
            <AnimatePresence>
              {isLoading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 animate-spin rounded-full border-4 border-[var(--accent-warm)] border-t-transparent mb-4"></div>
                  <p className="font-body text-sm text-[var(--text-tertiary)]">Loading designs catalog...</p>
                </motion.div>
              ) : filteredDesigns.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 flex flex-col items-center justify-center text-center border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-card)]">
                  <h3 className="font-headline text-2xl mb-2 text-[var(--text-primary)]">No designs found 😕</h3>
                  <p className="font-body text-sm text-[var(--text-tertiary)] max-w-sm">Try adjusting your filters or clearing them to see more results.</p>
                  <button onClick={clearAllFilters} className="mt-8 px-8 py-3.5 bg-[var(--accent-warm)] text-white rounded-lg font-bold text-sm hover:bg-[#5a4800] transition-colors shadow-md">
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-x-8 md:gap-y-16 px-4 md:px-0">
                  {filteredDesigns.map((design, index) => {
                    const isFeatured = design.featured && index === 0;

                    return (
                      <motion.article
                        key={design.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        className={`group relative cursor-pointer flex flex-col ${isFeatured ? 'lg:col-span-2' : ''}`}
                      >
                        <Link to={`/designs/${design.id}`} className="h-full flex flex-col bg-[var(--bg-card)] md:bg-transparent rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-[var(--border-subtle)] md:border-none relative">
                          <div className={`relative md:mb-6 ${isFeatured ? 'aspect-[16/10]' : 'aspect-[4/5] md:aspect-square'}`}>
      <div className="absolute inset-0 overflow-hidden rounded-t-2xl md:rounded-2xl bg-[var(--bg-card)]">
        <img
          src={cdnImg(design.image, 600)}
          alt={design.name}
          loading="lazy"
          width={800}
          height={800}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
          decoding="async" />
      </div>

                            <div className="absolute top-4 left-4 md:top-6 md:left-6">
                              <span className="bg-[var(--bg-surface)] backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest md:tracking-[0.2em] flex items-center gap-1 md:gap-2 shadow-md border-[var(--border-default)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                                <BadgeCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--accent-warm)] shrink-0" />
                                <span className="md:hidden">Verified</span>
                                <span className="hidden md:inline">Verified Design</span>
                              </span>
                            </div>
                            {/* Like button removed from inside Link */}

                            {isFeatured && (
                              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-end gap-4">
                                <div className="bg-[var(--bg-base)]/95 backdrop-blur-md p-6 rounded-lg max-w-sm w-full border border-[var(--border-subtle)] shadow-[var(--shadow-md)]">
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-warm)] mb-2">Featured Design</h4>
                                  <h3 className="text-2xl font-headline font-bold mb-3">{design.name}</h3>
                                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase opacity-60 tracking-wider">
                                    <span>{design.size}</span>
                                    <span>•</span>
                                    <span>{design.time} Build</span>
                                  </div>
                                </div>
                                <div className="bg-[var(--accent)] text-white p-6 rounded-lg shrink-0 shadow-[var(--shadow-md)] border border-[var(--border-subtle)]/10 hidden sm:block">
                                  <span className="text-[10px] uppercase opacity-60 block mb-1 tracking-widest">Starting from</span>
                                  <span className="text-2xl font-body font-bold">{design.totalCost}</span>
                                </div>
                              </div>
                            )}

                            {!isFeatured && (
                              <div className="absolute bottom-4 left-4">
                                <span className="bg-[var(--accent-warm)] text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-md">
                                  {design.style}
                                </span>
                              </div>
                            )}

{/* Hover FAB - Add to Cart / Quantity Controller */}
                            <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-30 ${isFeatured ? 'bottom-8 right-8 md:bottom-12 md:right-12' : '-bottom-5 md:-bottom-6 right-4 md:right-6'}`}>
                              {(() => {
                                const cartItem = cartItems.find(i => i.id === design.id);
                                if (cartItem) {
                                  return (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateQuantity(design.id, 0);
                                        toast.success(`${design.name} removed from cart.`);
                                      }}
                                      className="w-10 h-10 md:w-14 md:h-14 bg-[#ba1a1a] text-[var(--text-primary)] rounded-full flex items-center justify-center hover:bg-[#8a1212] transition-all shadow-xl"
                                      title="Remove from cart"
                                    >
                                      <Minus className="w-4 h-4 md:w-6 md:h-6" />
                                    </button>
                                  );
                                }
                                return (
                                  <button
                                    onClick={(e) => handleAddToCart(e, design)}
                                    className="w-10 h-10 md:w-14 md:h-14 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:bg-[var(--accent-hover)] hover:scale-110 transition-all shadow-xl"
                                  >
                                    <Plus className="w-4 h-4 md:w-6 md:h-6" />
                                  </button>
                                );
                              })()}
                            </div>
                          </div>

                          {!isFeatured && (
                            <div className="p-3 md:p-0 md:space-y-3 flex-grow flex flex-col bg-[var(--bg-card)] md:bg-transparent">
                              <div className="flex md:justify-between items-start flex-col md:flex-row md:gap-4 mb-1 md:mb-0">
                                <h3 className="text-xs md:text-xl font-headline font-bold leading-tight line-clamp-1">{design.name}</h3>
                              </div>

                              {/* Mobile simplified info */}
                              <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-tertiary)] md:hidden font-body font-medium mt-auto">
                                {design.category.replace("-", " ")}
                              </div>

                              {/* Desktop full info */}
                              <div className="hidden md:flex flex-col flex-grow">
                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed flex-grow">A beautiful {design.style.toLowerCase()} design, focusing on comfortable living and great attention to detail.</p>
                                <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest opacity-60 pt-3 border-t border-[var(--border-subtle)] mt-auto">
                                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {design.time}</span>
                                  <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5" /> {design.size}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Link>

                        {/* Like Button (Positioned over the card but outside Link) */}
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                          <button
                            type="button"
                            onClick={(e) => handleWishlistToggle(e, design)}
                            className={`w-7 h-7 md:w-10 md:h-10 ${isInWishlist(design.id) ? 'bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/20' : 'bg-[var(--bg-card)]/80 text-[var(--text-primary)] border-[var(--border-subtle)]'} backdrop-blur-md rounded-full flex items-center justify-center hover:text-[#ba1a1a] transition-colors shadow-sm cursor-pointer border shrink-0`}
                          >
                            <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isInWishlist(design.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>

            {/* Pagination/Loader */}
            {totalPages > 1 && (
              <div className="mt-24 flex flex-col items-center gap-6">
                <div className="h-[1px] w-full bg-[#e5e2df]"></div>

                {/* Flipkart Info Label */}
                <div className="text-xs text-[var(--text-tertiary)] font-body">
                  Showing page <span className="font-bold text-[var(--text-primary)]">{page}</span> of <span className="font-bold text-[var(--text-primary)]">{totalPages}</span> ({totalCount} total designs)
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
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold border transition-all ${page === p
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
            <SheetContent className="overflow-y-auto w-full md:hidden bg-[var(--bg-base)] z-[100] px-6 rounded-t-3xl border-0 shadow-2xl" side="bottom">
              <SheetHeader className="mb-6 pb-2 block">
                <SheetTitle className="font-headline text-2xl text-left bg-gradient-to-r from-[#1c1c1a] to-[#735c00] bg-clip-text text-transparent">Filter Settings</SheetTitle>
                <SheetDescription className="hidden">Filter options to refine the catalog of modern architectural designs.</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 md:space-y-3 pb-32">
                <div className="space-y-4">
                  <div className="flex justify-between items-center cursor-pointer group" onClick={() => toggleDropdown('draftCategory')}>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] opacity-80">Room Type</h3>
                    <ChevronDown className={`w-4 h-4 text-[var(--text-primary)] opacity-60 transition-transform ${expandedMobileDropdown === 'draftCategory' ? 'rotate-180' : ''}`} />
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileDropdown === 'draftCategory' ? 'max-h-96 opacity-100 flex flex-col gap-4' : 'max-h-0 opacity-0 hidden'}`}>
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors">
                        <input
                          type="radio"
                          name="draftCategory"
                          checked={draftCategory === cat.id}
                          onChange={() => setDraftCategory(cat.id)}
                          className="w-4 h-4 text-[var(--accent-warm)] border-[var(--border-default)] focus:ring-[#735c00] bg-transparent"
                        />
                        <span className={`text-sm font-medium transition-colors ${draftCategory === cat.id ? 'text-[var(--accent-warm)]' : 'text-[var(--text-secondary)]'}`}>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex justify-between items-center cursor-pointer group" onClick={() => toggleDropdown('draftStyle')}>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] opacity-80">Design Style</h3>
                    <ChevronDown className={`w-4 h-4 text-[var(--text-primary)] opacity-60 transition-transform ${expandedMobileDropdown === 'draftStyle' ? 'rotate-180' : ''}`} />
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedMobileDropdown === 'draftStyle' ? 'max-h-96 opacity-100 flex flex-col gap-4' : 'max-h-0 opacity-0 hidden'}`}>
                    <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors">
                      <input
                        type="radio"
                        name="draftStyle"
                        checked={draftStyle === "all"}
                        onChange={() => setDraftStyle("all")}
                        className="w-4 h-4 text-[var(--accent-warm)] border-[var(--border-default)] focus:ring-[#735c00] bg-transparent"
                      />
                      <span className={`text-sm font-medium transition-colors ${draftStyle === "all" ? 'text-[var(--accent-warm)]' : 'text-[var(--text-secondary)]'}`}>Any Style</span>
                    </label>
                    {styles.map(style => (
                      <label key={style} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors">
                        <input
                          type="radio"
                          name="draftStyle"
                          checked={draftStyle === style}
                          onChange={() => setDraftStyle(style)}
                          className="w-4 h-4 text-[var(--accent-warm)] border-[var(--border-default)] focus:ring-[#735c00] bg-transparent"
                        />
                        <span className={`text-sm font-medium transition-colors ${draftStyle === style ? 'text-[var(--accent-warm)]' : 'text-[var(--text-secondary)]'}`}>{style}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-6 bg-background backdrop-blur-md border-t border-[var(--border-subtle)] flex gap-4 pb-12">
                <button onClick={resetFilters} className="w-1/3 py-4 border border-[var(--border-subtle)] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--bg-base)] bg-[var(--bg-card)] transition-colors">Reset</button>
                <button onClick={applyFilters} className="flex-1 py-4 bg-[var(--accent)] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--accent-hover)] transition-colors shadow-xl">Apply Filters</button>
              </div>
            </SheetContent>
          </Sheet>

        </main>
      </div>
    </Layout>
  );
};

export default DesignsCatalog;
