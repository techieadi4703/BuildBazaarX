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

// Images
import kitchenImage from "@/assets/kitchen-design.jpg";
import bedroomImage from "@/assets/bedroom-design.jpg";
import livingroomImage from "@/assets/livingroom-design.jpg";
import wardrobeImage from "@/assets/wardrobe-design.jpg";
import fullhomeImage from "@/assets/fullhome-design.jpg";

const categories = [
  { id: "all", name: "All Designs" },
  { id: "full-home", name: "Full Home" },
  { id: "kitchen", name: "Kitchen" },
  { id: "living-room", name: "Living Room" },
  { id: "bedroom", name: "Bedroom" },
  { id: "bathroom", name: "Bathroom" },
];

const styles = ["Modern", "Luxury", "Minimal", "Traditional", "Contemporary"];

// const staticDesigns = [
//   {
//     id: 1,
//     name: "The Obsidian Pavilion",
//     category: "full-home",
//     image: fullhomeImage,
//     size: "2400 sq ft",
//     style: "Modern",
//     totalCost: "$12,400",
//     time: "8 Months",
//     featured: true,
//   },
//   {
//     id: 2,
//     name: "Etheric Timber Lodge",
//     category: "bedroom",
//     image: bedroomImage,
//     size: "800 sq ft",
//     style: "Traditional",
//     totalCost: "$8,900",
//     time: "6 Months",
//     featured: false,
//   },
//   {
//     id: 3,
//     name: "Monolith Residence",
//     category: "living-room",
//     image: livingroomImage,
//     size: "1200 sq ft",
//     style: "Minimal",
//     totalCost: "$15,200",
//     time: "12 Months",
//     featured: false,
//   },
//   {
//     id: 4,
//     name: "Azure Infinity House",
//     category: "full-home",
//     image: kitchenImage, // Placeholder
//     size: "4500 sq ft",
//     style: "Luxury",
//     totalCost: "$21,000",
//     time: "14 Months",
//     featured: false,
//   },
//   {
//     id: 5,
//     name: "The Heritage Barn",
//     category: "kitchen",
//     image: wardrobeImage, // Placeholder
//     size: "950 sq ft",
//     style: "Contemporary",
//     totalCost: "$7,200",
//     time: "5 Months",
//     featured: false,
//   },
// ];

const DesignsCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMobileDropdown, setExpandedMobileDropdown] = useState<string | null>(null);

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

  const { data: dbDesigns, isLoading } = useQuery({
    queryKey: ['designs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('designs')
        .select('*, designers(full_name)')
        .eq('is_published', true);
      return data || [];
    },
    staleTime: 60000,
  });

  const allDesigns = useMemo(() => {
    const mappedDbDesigns = (dbDesigns || []).map((dbD: any) => ({
      id: `db-${dbD.id}`,
      name: dbD.name,
      category: dbD.category.toLowerCase().replace(" ", "-"),
      image: (dbD.images && dbD.images.length > 0) ? dbD.images[0] : fullhomeImage,
      size: dbD.room_size || "Standard",
      style: dbD.style,
      totalCost: `₹${(dbD.total_cost || 0).toLocaleString('en-IN')}`,
      time: "Variable",
      featured: dbD.is_trending || false,
    }));
    return [...mappedDbDesigns];
  }, [dbDesigns]);

  const filteredDesigns = useMemo(() => {
    return allDesigns.filter((design) => {
      const matchesCat = selectedCategory === "all" || design.category === selectedCategory;
      const matchesStyle = selectedStyle === "all" || design.style === selectedStyle;
      const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesStyle && matchesSearch;
    });
  }, [allDesigns, selectedCategory, selectedStyle, searchQuery]);

  return (
    <Layout>
      <Helmet>
        <title>Home Interior Designs Catalog | BuildBazaarX</title>
        <meta name="description" content="Browse 500+ verified home interior designs on BuildBazaarX — full home, kitchen, bedroom, living room & more. Filter by style, size, and budget. Get your dream home today." />
        <link rel="canonical" href="https://buildbazaarx.com/designs" />
        <meta property="og:url" content="https://buildbazaarx.com/designs" />
        <meta property="og:title" content="Home Interior Designs Catalog | BuildBazaarX" />
        <meta property="og:description" content="Browse 500+ verified home interior design blueprints. Full home, kitchen, bedroom & more. Filter by style and budget." />
      </Helmet>
      <div className="bg-[#fcf9f6] text-[#1c1c1a] min-h-screen font-body w-full">
        <main className="max-w-[1920px] mx-auto flex flex-col md:flex-row min-h-screen relative">
          
          {/* Mobile Top Navigation (Search + Button) */}
          <div className="md:hidden flex flex-col px-4 pt-4 pb-2 bg-[#fcf9f6] space-y-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] w-4 h-4" />
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e2df] focus:border-[#735c00] rounded-xl text-sm outline-none shadow-sm" 
                  placeholder="Search designs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                />
              </div>
              <button 
                onClick={openFilterSheet}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#f6f3f0] border border-[#e5e2df] rounded-xl text-sm font-medium whitespace-nowrap hover:bg-[#eae8e5] transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
            </div>
            
            <div className="flex items-center justify-between text-sm pt-2">
              <span className="text-[#74777d]">Showing <span className="font-bold text-[#1c1c1a]">{filteredDesigns.length}</span> designs</span>
              <div className="flex items-center cursor-pointer font-medium text-[#1c1c1a]">
                Newest <ChevronDown className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Active filter pills */}
            {(selectedCategory !== "all" || selectedStyle !== "all") && (
              <div className="flex flex-wrap gap-2 pt-1 pb-1">
                {selectedCategory !== "all" && (
                  <span className="bg-[#f6f3f0] border border-[#e5e2df] text-[#1c1c1a] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <X className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setSelectedCategory('all')} />
                  </span>
                )}
                {selectedStyle !== "all" && (
                  <span className="bg-[#f6f3f0] border border-[#e5e2df] text-[#1c1c1a] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
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
            className="md:hidden fixed bottom-24 right-6 z-30 bg-[#735c00] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <Sliders className="w-6 h-6" />
          </button>

          {/* Desktop Sidebar Filter */}
          <aside className="hidden w-80 px-4 py-8 pt-6 md:px-5 md:flex flex-col gap-4 bg-[#f6f3f0] border-r border-[#e5e2df] shrink-0 sticky top-0 h-auto">
            <div className="flex flex-col gap-6 md:gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline italic text-2xl">Curation Filter</h2>
                {(selectedCategory !== "all" || selectedStyle !== "all" || searchQuery !== "") && (
                  <button 
                    onClick={clearAllFilters}
                    className="font-body text-[10px] font-bold uppercase tracking-widest text-[#74777d] hover:text-[#735c00]"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="relative w-full md:w-[85%]">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] w-4 h-4" />
                 <input 
                   className="pl-10 pr-4 py-3 bg-white border border-[#e5e2df] focus:border-[#735c00] rounded text-sm w-full outline-none font-body shadow-sm" 
                   placeholder="Search designs..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   type="text"
                 />
              </div>
            </div>

            <div className="space-y-4 md:space-y-3">
              <div className="space-y-4 md:space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1a] opacity-60">Spatial Category</h3>
                <div className="flex flex-col gap-3 md:gap-2">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="desktopCategory"
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(cat.id)}
                        className="w-4 h-4 text-[#735c00] border-[#c4c6cc] focus:ring-[#735c00] bg-transparent" 
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'text-[#735c00]' : 'group-hover:text-[#735c00]'}`}>
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:space-y-3 pt-4 border-t border-[#e5e2df]">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1a] opacity-60">Architectural Styles</h3>
                <div className="flex flex-col gap-3 md:gap-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="desktopStyle"
                      checked={selectedStyle === "all"}
                      onChange={() => setSelectedStyle("all")}
                      className="w-4 h-4 text-[#735c00] border-[#c4c6cc] focus:ring-[#735c00] bg-transparent" 
                    />
                    <span className={`text-sm font-medium transition-colors ${selectedStyle === "all" ? 'text-[#735c00]' : 'group-hover:text-[#735c00]'}`}>
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
                        className="w-4 h-4 text-[#735c00] border-[#c4c6cc] focus:ring-[#735c00] bg-transparent" 
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedStyle === style ? 'text-[#735c00]' : 'group-hover:text-[#735c00]'}`}>
                        {style}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Content Canvas */}
          <section className="flex-1 p-0 md:p-8 md:px-16 md:pt-8 md:pb-4 bg-[#fcf9f6]">
            
            {/* Header - Hidden on mobile, handled by mobile top bar */}
            <header className="hidden md:block mb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-2xl">
                  <h1 className="text-6xl md:text-8xl font-headline leading-tight tracking-tight mb-6 md:mb-2">
                    Designs <br className="md:hidden" /><span className="italic font-normal">Catalog.</span>
                  </h1>
                </div>
                <div className="flex shrink-0">
                  <span className="px-5 py-2.5 bg-[#eae8e5] rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#735c00]"></span>
                    {filteredDesigns.length} Designs Active
                  </span>
                </div>
              </div>
            </header>

            {/* Grid */}
            <AnimatePresence>
              {isLoading ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 animate-spin rounded-full border-4 border-[#735c00] border-t-transparent mb-4"></div>
                    <p className="font-body text-sm text-[#74777d]">Loading designs catalog...</p>
                 </motion.div>
              ) : filteredDesigns.length === 0 ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 flex flex-col items-center justify-center text-center border border-[#e5e2df] rounded-lg bg-[#f6f3f0]">
                    <h3 className="font-headline text-2xl mb-2 text-[#1c1c1a]">No designs found 😕</h3>
                    <p className="font-body text-sm text-[#74777d] max-w-sm">Try adjusting your filters or clearing them to see more results.</p>
                    <button onClick={clearAllFilters} className="mt-8 px-8 py-3.5 bg-[#735c00] text-white rounded-lg font-bold text-sm hover:bg-[#5a4800] transition-colors shadow-md">
                      Clear Filters
                    </button>
                 </motion.div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-x-8 md:gap-y-16 px-4 md:px-0">
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
                        <Link to={`/designs/${design.id}`} className="h-full flex flex-col bg-white md:bg-transparent rounded-2xl md:rounded-none overflow-hidden shadow-sm md:shadow-none border border-[#e5e2df] md:border-none relative">
                          <div className={`relative overflow-hidden bg-[#f6f3f0] md:mb-6 ${isFeatured ? 'aspect-[16/10]' : 'aspect-[4/5] md:aspect-square'}`}>
                            <img 
                              src={design.image} 
                              alt={design.name} 
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply opacity-90"
                            />
                            
                            <div className="absolute top-4 left-4 md:top-6 md:left-6">
                              <span className="bg-[#fcf9f6]/90 backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest md:tracking-[0.2em] flex items-center gap-1 md:gap-2 shadow-sm border border-[#e5e2df]">
                                <BadgeCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#735c00] shrink-0" />
                                <span className="md:hidden">Verified</span>
                                <span className="hidden md:inline">Verified Blueprint</span>
                              </span>
                            </div>
                            {/* Like button removed from inside Link */}

                            {isFeatured && (
                              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-end gap-4">
                                <div className="bg-[#fcf9f6]/95 backdrop-blur-md p-6 rounded-lg max-w-sm w-full border border-[#e5e2df] shadow-lg">
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00] mb-2">Featured Blueprint</h4>
                                  <h3 className="text-2xl font-headline font-bold mb-3">{design.name}</h3>
                                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase opacity-60 tracking-wider">
                                    <span>{design.size}</span>
                                    <span>•</span>
                                    <span>{design.time} Build</span>
                                  </div>
                                </div>
                                <div className="bg-[#1c1c1a] text-white p-6 rounded-lg shrink-0 shadow-lg border border-black/10 hidden sm:block">
                                  <span className="text-[10px] uppercase opacity-60 block mb-1 tracking-widest">Starting from</span>
                                  <span className="text-2xl font-body font-bold">{design.totalCost}</span>
                                </div>
                              </div>
                            )}

                            {!isFeatured && (
                              <div className="absolute bottom-4 left-4">
                                <span className="bg-[#735c00] text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-md">
                                  {design.style}
                                </span>
                              </div>
                            )}

                          </div>
                          
                          {!isFeatured && (
                            <div className="p-3 md:p-0 md:space-y-3 flex-grow flex flex-col bg-white md:bg-transparent">
                              <div className="flex md:justify-between items-start flex-col md:flex-row md:gap-4 mb-1 md:mb-0">
                                <h3 className="text-xs md:text-xl font-headline font-bold leading-tight line-clamp-1">{design.name}</h3>
                              </div>
                              
                              {/* Mobile simplified info */}
                              <div className="flex items-center gap-1.5 text-[9px] text-[#74777d] md:hidden font-body font-medium mt-auto">
                                {design.category.replace("-", " ")}
                              </div>

                              {/* Desktop full info */}
                              <div className="hidden md:flex flex-col flex-grow">
                                <p className="text-sm text-[#44474c] line-clamp-2 leading-relaxed flex-grow">A masterclass in {design.style.toLowerCase()} luxury, focusing on spatial harmony and robust architectural detailing.</p>
                                <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest opacity-60 pt-3 border-t border-[#e5e2df] mt-auto">
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
                            className={`w-7 h-7 md:w-10 md:h-10 ${isInWishlist(design.id) ? 'bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/20' : 'bg-white/80 text-[#1c1c1a] border-[#e5e2df]'} backdrop-blur-md rounded-full flex items-center justify-center hover:text-[#ba1a1a] transition-colors shadow-sm cursor-pointer border shrink-0`}
                          >
                            <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isInWishlist(design.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        {/* Hover FAB - Add to Cart / Quantity Controller */}
                        <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-30 ${isFeatured ? 'bottom-8 right-8 md:bottom-12 md:right-12' : 'bottom-[70px] right-4 md:bottom-20 md:right-4'}`}>
                          {(() => {
                            const cartItem = cartItems.find(i => i.id === design.id);
                            if (cartItem) {
                              return (
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQuantity(design.id, 0); // removes from cart
                                    toast.success(`${design.name} removed from cart.`);
                                  }}
                                  className="w-10 h-10 md:w-12 md:h-12 bg-[#ba1a1a] text-white rounded-full flex items-center justify-center hover:bg-[#8a1212] transition-all shadow-lg"
                                  title="Remove from cart"
                                >
                                  <Minus className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                              );
                            }
                            return (
                              <button 
                                onClick={(e) => handleAddToCart(e, design)}
                                className="w-10 h-10 md:w-12 md:h-12 bg-[#1c1c1a] text-white rounded-full flex items-center justify-center hover:bg-[#735c00] hover:scale-110 transition-all shadow-lg"
                              >
                                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            );
                          })()}
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>

            {/* Pagination/Loader */}
            {filteredDesigns.length > 0 && (
              <div className="mt-24 flex flex-col items-center gap-8">
                <div className="h-[1px] w-full bg-[#e5e2df]"></div>
                <button className="px-12 py-5 border border-[#c4c6cc] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#1c1c1a] hover:text-white transition-all duration-500 rounded-sm">
                  Discover More Blueprints
                </button>
              </div>
            )}

          </section>

          {/* Mobile Bottom Sheet for Filters */}
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
             <SheetContent className="overflow-y-auto w-full md:hidden bg-[#fcf9f6] z-[100] px-6 rounded-t-3xl border-0 shadow-2xl" side="bottom">
               <SheetHeader className="mb-6 pb-2 block">
                 <SheetTitle className="font-headline text-2xl text-left bg-gradient-to-r from-[#1c1c1a] to-[#735c00] bg-clip-text text-transparent">Filter Settings</SheetTitle>
                 <SheetDescription className="hidden">Filter options to refine the catalog of modern architectural designs.</SheetDescription>
               </SheetHeader>
               
               <div className="space-y-4 md:space-y-3 pb-32">
                 <div className="space-y-4">
                   <div className="flex justify-between items-center cursor-pointer group" onClick={() => toggleDropdown('draftCategory')}>
                     <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1c1c1a] opacity-80">Spatial Category</h3>
                     <ChevronDown className={`w-4 h-4 text-[#1c1c1a] opacity-60 transition-transform ${expandedMobileDropdown === 'draftCategory' ? 'rotate-180' : ''}`} />
                   </div>
                   <div className={`overflow-hidden transition-all duration-300 ${expandedMobileDropdown === 'draftCategory' ? 'max-h-96 opacity-100 flex flex-col gap-4' : 'max-h-0 opacity-0 hidden'}`}>
                     {categories.map(cat => (
                       <label key={cat.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                         <input 
                           type="radio" 
                           name="draftCategory"
                           checked={draftCategory === cat.id}
                           onChange={() => setDraftCategory(cat.id)}
                           className="w-4 h-4 text-[#735c00] border-[#c4c6cc] focus:ring-[#735c00] bg-transparent" 
                         />
                         <span className={`text-sm font-medium transition-colors ${draftCategory === cat.id ? 'text-[#735c00]' : 'text-[#44474c]'}`}>{cat.name}</span>
                       </label>
                     ))}
                   </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-[#e5e2df]">
                    <div className="flex justify-between items-center cursor-pointer group" onClick={() => toggleDropdown('draftStyle')}>
                     <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1c1c1a] opacity-80">Architectural Styles</h3>
                     <ChevronDown className={`w-4 h-4 text-[#1c1c1a] opacity-60 transition-transform ${expandedMobileDropdown === 'draftStyle' ? 'rotate-180' : ''}`} />
                   </div>
                   <div className={`overflow-hidden transition-all duration-300 ${expandedMobileDropdown === 'draftStyle' ? 'max-h-96 opacity-100 flex flex-col gap-4' : 'max-h-0 opacity-0 hidden'}`}>
                     <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                       <input 
                         type="radio" 
                         name="draftStyle"
                         checked={draftStyle === "all"}
                         onChange={() => setDraftStyle("all")}
                         className="w-4 h-4 text-[#735c00] border-[#c4c6cc] focus:ring-[#735c00] bg-transparent" 
                       />
                       <span className={`text-sm font-medium transition-colors ${draftStyle === "all" ? 'text-[#735c00]' : 'text-[#44474c]'}`}>Any Style</span>
                     </label>
                     {styles.map(style => (
                       <label key={style} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                         <input 
                           type="radio" 
                           name="draftStyle"
                           checked={draftStyle === style}
                           onChange={() => setDraftStyle(style)}
                           className="w-4 h-4 text-[#735c00] border-[#c4c6cc] focus:ring-[#735c00] bg-transparent" 
                         />
                         <span className={`text-sm font-medium transition-colors ${draftStyle === style ? 'text-[#735c00]' : 'text-[#44474c]'}`}>{style}</span>
                       </label>
                     ))}
                   </div>
                 </div>
               </div>

               <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e5e2df] flex gap-4 pb-12">
                  <button onClick={resetFilters} className="w-1/3 py-4 border border-[#e5e2df] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#fcf9f6] bg-white transition-colors">Reset</button>
                  <button onClick={applyFilters} className="flex-1 py-4 bg-[#1c1c1a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#735c00] transition-colors shadow-xl">Apply Filters</button>
               </div>
             </SheetContent>
          </Sheet>

        </main>
      </div>
    </Layout>
  );
};

export default DesignsCatalog;
