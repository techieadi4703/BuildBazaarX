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

  const mockDesigns = [
    {
      id: "mock-1",
      name: "The Obsidian Loft",
      designer: { full_name: "Aaryan Sharma" },
      category: "full-home",
      style: "Modern",
      image: fullhomeImage,
      totalCost: "₹18,50,000",
      size: "1800 sqft",
      time: "60 Days"
    },
    {
      id: "mock-2",
      name: "Nordic Culinary Suite",
      designer: { full_name: "Priya Verma" },
      category: "kitchen",
      style: "Minimal",
      image: kitchenImage,
      totalCost: "₹4,20,000",
      size: "120 sqft",
      time: "20 Days"
    },
    {
      id: "mock-3",
      name: "Royal Velvet Sanctuary",
      designer: { full_name: "Vikram Malhotra" },
      category: "bedroom",
      style: "Luxury",
      image: bedroomImage,
      totalCost: "₹3,15,000",
      size: "250 sqft",
      time: "15 Days"
    },
    {
      id: "mock-4",
      name: "Etheric Drawing Room",
      designer: { full_name: "Sneha Kapur" },
      category: "living-room",
      style: "Contemporary",
      image: livingroomImage,
      totalCost: "₹5,40,000",
      size: "350 sqft",
      time: "25 Days"
    },
    {
      id: "mock-5",
      name: "Sleek Wardrobe System",
      designer: { full_name: "Rahul Mehta" },
      category: "bedroom",
      style: "Modern",
      image: wardrobeImage,
      totalCost: "₹1,85,000",
      size: "80 sqft",
      time: "10 Days"
    }
  ];

  const allDesigns = useMemo(() => {
    const dbData = dbDesigns || [];
    const mappedDbDesigns = dbData.map((dbD: any) => ({
      id: `db-${dbD.id}`,
      name: dbD.name || "Unnamed Design",
      designer: dbD.designers || { full_name: "Lead Architect" },
      category: dbD.category || "General",
      style: dbD.style || "Modern",
      image: dbD.image_url || fullhomeImage,
      totalCost: dbD.price_range || `₹${(dbD.total_cost || 0).toLocaleString('en-IN')}`,
      size: dbD.sqft || dbD.room_size || "Standard",
      time: dbD.completion_time || "Variable"
    }));

    // If DB is empty, use mock data
    return mappedDbDesigns.length > 0 ? mappedDbDesigns : mockDesigns;
  }, [dbDesigns, mockDesigns]);

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
        <meta property="og:image" content="https://buildbazaarx.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Helmet>
      <div className="bg-[#fcf9f6] text-[#1c1c1a] min-h-screen font-body w-full">
        <main className="max-w-[1920px] mx-auto flex flex-col md:flex-row min-h-screen relative">
          
          {/* Mobile Top Navigation (Search + Button) */}
          <div className="md:hidden flex flex-col px-4 pt-4 pb-2 bg-[#fcf9f6] space-y-4 sticky top-0 z-20 shadow-sm border-b border-[#e5e2df]">
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
            
            {/* Active filter pills */}
            {(selectedCategory !== 'all' || selectedStyle !== 'all') && (
              <div className="flex flex-wrap gap-2 pt-1 pb-1">
                {selectedCategory !== 'all' && (
                  <span className="bg-[#f6f3f0] border border-[#e5e2df] text-[#1c1c1a] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <X className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setSelectedCategory('all')} />
                  </span>
                )}
                {selectedStyle !== 'all' && (
                  <span className="bg-[#f6f3f0] border border-[#e5e2df] text-[#1c1c1a] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                    {selectedStyle}
                    <X className="w-3 h-3 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setSelectedStyle('all')} />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden md:flex flex-col w-full md:w-80 lg:w-96 border-r border-[#e5e2df] p-8 md:p-12 sticky top-0 h-screen overflow-y-auto">
            <div className="mb-16">
              <h1 className="text-4xl md:text-6xl font-headline font-bold leading-none tracking-tighter mb-4">Curation <span className="italic font-normal">Filter</span></h1>
              <div className="w-12 h-0.5 bg-[#735c00]/30" />
            </div>

            <div className="space-y-12">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c4c6cc] group-focus-within:text-[#735c00] transition-colors w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search designs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-[#e5e2df] focus:border-[#735c00] rounded-xl text-sm outline-none transition-all"
                />
              </div>

              {/* Categories */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#74777d]">Spatial Category</h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="category"
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(cat.id)}
                          className="peer appearance-none w-4 h-4 rounded-full border border-[#c4c6cc] checked:border-[#735c00] transition-all"
                        />
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-[#735c00] scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'text-[#735c00]' : 'text-[#44474c] group-hover:text-black'}`}>
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Styles */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#74777d]">Architectural Styles</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="style"
                        checked={selectedStyle === "all"}
                        onChange={() => setSelectedStyle("all")}
                        className="peer appearance-none w-4 h-4 rounded-full border border-[#c4c6cc] checked:border-[#735c00] transition-all"
                      />
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-[#735c00] scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                    <span className={`text-sm font-medium transition-colors ${selectedStyle === "all" ? 'text-[#735c00]' : 'text-[#44474c] group-hover:text-black'}`}>
                      Any Style
                    </span>
                  </label>
                  {styles.map((style) => (
                    <label key={style} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="style"
                          checked={selectedStyle === style}
                          onChange={() => setSelectedStyle(style)}
                          className="peer appearance-none w-4 h-4 rounded-full border border-[#c4c6cc] checked:border-[#735c00] transition-all"
                        />
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-[#735c00] scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className={`text-sm font-medium transition-colors ${selectedStyle === style ? 'text-[#735c00]' : 'text-[#44474c] group-hover:text-black'}`}>
                        {style}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={clearAllFilters}
                className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#74777d] hover:text-[#735c00] border border-[#e5e2df] rounded-xl hover:bg-[#f6f3f0] transition-all"
              >
                Clear Filters
              </button>
            </div>

            <div className="mt-auto pt-12 border-t border-[#e5e2df]">
              <p className="text-[10px] text-[#c4c6cc] leading-relaxed">
                Platform Release: v4.1.0_PROD <br />
                © BuildBazaarX Monograph Layer
              </p>
            </div>
          </aside>

          {/* Catalog Grid */}
          <section className="flex-1 p-8 md:p-12 lg:p-20 overflow-y-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
              <div className="max-w-2xl">
                <h2 className="text-7xl md:text-9xl font-headline font-bold tracking-tighter leading-[0.8] mb-8">
                  Designs <br /> <span className="italic">Catalog.</span>
                </h2>
                <div className="flex items-center gap-4 text-[#74777d] text-sm uppercase tracking-widest font-bold">
                  <Compass className="w-4 h-4" />
                  <span>Verified Architectural Assets</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 bg-[#735c00]/5 px-4 py-2 rounded-full border border-[#735c00]/10">
                  <div className="w-2 h-2 rounded-full bg-[#735c00] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#735c00]">
                    {filteredDesigns.length} Designs Active
                  </span>
                </div>
              </div>
            </header>

            {isLoading ? (
              <div className="h-[50vh] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-4 border-[#735c00]/20 border-t-[#735c00] rounded-full animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#74777d] animate-pulse">Loading designs catalog...</p>
              </div>
            ) : filteredDesigns.length === 0 ? (
              <div className="h-[40vh] border-2 border-dashed border-[#e5e2df] rounded-[3rem] flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 bg-[#f6f3f0] rounded-2xl flex items-center justify-center mb-6">
                  <X className="w-8 h-8 text-[#c4c6cc]" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No Elements Active</h3>
                <p className="text-[#74777d] font-medium mb-8">Shift curation filters to uncover available components.</p>
                <button 
                  onClick={clearAllFilters}
                  className="px-8 py-4 bg-[#1c1c1a] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#735c00] transition-colors shadow-xl"
                >
                  Reset Parameters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12">
                <AnimatePresence mode="popLayout">
                  {filteredDesigns.map((design, idx) => (
                    <motion.div
                      layout
                      key={design.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link to={`/designs/${design.id}`} className="group block h-full">
                        <article className="h-full flex flex-col bg-white rounded-[2rem] overflow-hidden border border-black/5 hover:border-[#735c00]/50 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] group relative">
                          <div className="relative aspect-[4/5] overflow-hidden">
                            <img 
                              src={design.image} 
                              alt={design.name} 
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            {/* Action Buttons (Floating) */}
                            <div className="absolute top-6 right-6 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                              <button 
                                onClick={(e) => handleWishlistToggle(e, design)}
                                className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${
                                  isInWishlist(design.id) 
                                    ? 'bg-[#735c00] border-[#735c00] text-white' 
                                    : 'bg-white/80 border-white/20 text-[#1c1c1a] hover:bg-[#735c00] hover:border-[#735c00] hover:text-white'
                                }`}
                              >
                                <Heart className={`w-5 h-5 ${isInWishlist(design.id) ? 'fill-current' : ''}`} />
                              </button>
                              <button 
                                onClick={(e) => handleAddToCart(e, design)}
                                className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-[#1c1c1a] hover:bg-[#735c00] hover:border-[#735c00] hover:text-white transition-all"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                               <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1 py-3 px-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Inspect Details</span>
                                  </div>
                               </div>
                            </div>
                          </div>

                          <div className="p-8 flex-grow flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#735c00]">{design.category}</span>
                              <div className="flex items-center gap-1.5">
                                <BadgeCheck className="w-3 h-3 text-[#735c00]" />
                                <span className="text-[10px] font-bold text-[#c4c6cc] uppercase tracking-widest">Verified</span>
                              </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-[#1c1c1a] mb-4 group-hover:text-[#735c00] transition-colors leading-tight">{design.name}</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mt-auto">
                              <div className="space-y-1">
                                <span className="block text-[10px] text-[#74777d] uppercase tracking-tighter">Est. Value</span>
                                <span className="block text-sm font-bold text-[#1c1c1a]">{design.totalCost}</span>
                              </div>
                              <div className="space-y-1 text-right">
                                <span className="block text-[10px] text-[#74777d] uppercase tracking-tighter">Footprint</span>
                                <span className="block text-sm font-medium text-[#1c1c1a]">{design.size}</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Mobile Bottom Sheet for Filters */}
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
             <SheetContent className="overflow-y-auto w-full md:hidden bg-[#fcf9f6] z-[100] px-6 rounded-t-3xl border-0 shadow-2xl" side="bottom">
               <SheetHeader className="mb-8 pb-2 block">
                 <SheetTitle className="font-headline text-3xl text-left bg-gradient-to-r from-[#1c1c1a] to-[#735c00] bg-clip-text text-transparent">Curation Parameters</SheetTitle>
                 <SheetDescription className="hidden">Filter options to refine the catalog of architectural designs.</SheetDescription>
               </SheetHeader>
               
               <div className="space-y-12 pb-32">
                 {/* Category Filter */}
                 <div className="space-y-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#74777d]">Spatial Grid</h3>
                   <div className="grid grid-cols-2 gap-3">
                     {categories.map(cat => (
                       <button
                         key={cat.id}
                         onClick={() => setDraftCategory(cat.id)}
                         className={`py-4 rounded-xl text-xs font-bold transition-all border ${
                           draftCategory === cat.id 
                             ? 'bg-[#1c1c1a] border-[#1c1c1a] text-white' 
                             : 'bg-white border-[#e5e2df] text-[#44474c]'
                         }`}
                       >
                         {cat.name}
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Style Filter */}
                 <div className="space-y-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#74777d]">Aesthetic Vector</h3>
                   <div className="flex flex-wrap gap-3">
                     <button
                        onClick={() => setDraftStyle("all")}
                        className={`px-5 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          draftStyle === "all"
                            ? 'bg-[#735c00] border-[#735c00] text-white'
                            : 'bg-white border-[#e5e2df] text-[#44474c]'
                        }`}
                      >
                        All Styles
                      </button>
                     {styles.map(style => (
                       <button
                         key={style}
                         onClick={() => setDraftStyle(style)}
                         className={`px-5 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                           draftStyle === style 
                             ? 'bg-[#735c00] border-[#735c00] text-white' 
                             : 'bg-white border-[#e5e2df] text-[#44474c]'
                         }`}
                       >
                         {style}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>

               <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e5e2df] flex gap-4 pb-12">
                  <button onClick={resetFilters} className="w-1/3 py-4 border border-[#e5e2df] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#fcf9f6] bg-white transition-colors">Reset</button>
                  <button onClick={applyFilters} className="flex-1 py-4 bg-[#1c1c1a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#735c00] transition-colors shadow-xl">Calibrate Results</button>
               </div>
             </SheetContent>
          </Sheet>
        </main>
      </div>
    </Layout>
  );
};

export default DesignsCatalog;
