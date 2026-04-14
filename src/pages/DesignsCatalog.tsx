import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Heart, BadgeCheck, Clock, Compass, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { motion, AnimatePresence } from "framer-motion";

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

const staticDesigns = [
  {
    id: 1,
    name: "The Obsidian Pavilion",
    category: "full-home",
    image: fullhomeImage,
    size: "2400 sq ft",
    style: "Modern",
    totalCost: "$12,400",
    time: "8 Months",
    featured: true,
  },
  {
    id: 2,
    name: "Etheric Timber Lodge",
    category: "bedroom",
    image: bedroomImage,
    size: "800 sq ft",
    style: "Traditional",
    totalCost: "$8,900",
    time: "6 Months",
    featured: false,
  },
  {
    id: 3,
    name: "Monolith Residence",
    category: "living-room",
    image: livingroomImage,
    size: "1200 sq ft",
    style: "Minimal",
    totalCost: "$15,200",
    time: "12 Months",
    featured: false,
  },
  {
    id: 4,
    name: "Azure Infinity House",
    category: "full-home",
    image: kitchenImage, // Placeholder
    size: "4500 sq ft",
    style: "Luxury",
    totalCost: "$21,000",
    time: "14 Months",
    featured: false,
  },
  {
    id: 5,
    name: "The Heritage Barn",
    category: "kitchen",
    image: wardrobeImage, // Placeholder
    size: "950 sq ft",
    style: "Contemporary",
    totalCost: "$7,200",
    time: "5 Months",
    featured: false,
  },
];

const DesignsCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: dbDesigns } = useQuery({
    queryKey: ['designs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('designs')
        .select('*, designers(full_name)')
        .eq('is_published', true);
      return data || [];
    }
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
    return [...staticDesigns, ...mappedDbDesigns];
  }, [dbDesigns]);

  const filteredDesigns = allDesigns.filter((design) => {
    const matchesCat = selectedCategory === "all" || design.category === selectedCategory;
    const matchesStyle = selectedStyle === "all" || design.style === selectedStyle;
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStyle && matchesSearch;
  });

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
      {/* Dynamic font injection for the page to ensure perfection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap');
        .font-headline { font-family: 'Newsreader', serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
      `}</style>

      <div className="bg-[#fcf9f6] text-[#1c1c1a] min-h-screen font-body w-full">
        <main className="max-w-[1920px] mx-auto flex flex-col md:flex-row min-h-screen">
          
          {/* Sidebar Filter */}
          <aside className="w-full md:w-80 p-8 md:p-12 space-y-12 bg-[#f6f3f0] border-r border-[#e5e2df] shrink-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-headline italic text-2xl">Curation Filter</h2>
              {(selectedCategory !== "all" || selectedStyle !== "all" || searchQuery !== "") && (
                <button 
                  onClick={() => { setSelectedCategory("all"); setSelectedStyle("all"); setSearchQuery(""); }}
                  className="font-body text-[10px] font-bold uppercase tracking-widest text-[#74777d] hover:text-[#735c00]"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="relative w-full mb-8">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74777d] w-4 h-4" />
               <input 
                 className="pl-10 pr-4 py-3 bg-white border border-[#e5e2df] focus:border-[#735c00] rounded text-sm w-full outline-none font-body shadow-sm" 
                 placeholder="Search designs..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 type="text"
               />
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1a] opacity-60">Spatial Category</h3>
              <div className="flex flex-col gap-4">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category"
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

            <div className="space-y-6 pt-6 border-t border-[#e5e2df]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1c1c1a] opacity-60">Architectural Styles</h3>
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="style"
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
                      name="style"
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

            <button className="w-full py-4 mt-8 bg-[#1c1c1a] text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#735c00] transition-colors shadow-lg">
              Apply Curation
            </button>
          </aside>

          {/* Content Canvas */}
          <section className="flex-1 p-8 md:p-16 bg-[#fcf9f6]">
            
            {/* Header */}
            <header className="mb-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-2xl">
                  <h1 className="text-6xl md:text-8xl font-headline leading-tight tracking-tight mb-6">
                    Designs <br/><span className="italic font-normal">Catalog.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-[#44474c] leading-relaxed font-body">
                    A curated monograph of avant-garde blueprints. Every design is engineered for structural integrity and high-end aesthetic resonance.
                  </p>
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
              {filteredDesigns.length === 0 ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center border border-[#e5e2df] rounded-lg bg-[#f6f3f0]">
                    <h3 className="font-headline italic text-2xl mb-2 text-[#1c1c1a]">No Blueprints Found</h3>
                    <p className="font-body text-sm text-[#74777d]">Adjust the structural filters to reveal more monographs.</p>
                 </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {filteredDesigns.map((design, index) => {
                    const isFeatured = design.featured && index === 0;

                    return (
                      <motion.article 
                        key={design.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group cursor-pointer flex flex-col ${isFeatured ? 'lg:col-span-2' : ''}`}
                      >
                        <Link to={`/designs/${design.id}`} className="block h-full flex flex-col">
                          <div className={`relative overflow-hidden bg-[#f6f3f0] mb-6 rounded-sm ${isFeatured ? 'aspect-[16/10]' : 'aspect-square'}`}>
                            <img 
                              src={design.image} 
                              alt={design.name} 
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply opacity-90"
                            />
                            
                            <div className="absolute top-6 left-6">
                              <span className="bg-[#fcf9f6]/90 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm border border-[#e5e2df]">
                                <BadgeCheck className="w-3.5 h-3.5 text-[#735c00]" />
                                Verified Blueprint
                              </span>
                            </div>

                            {/* Like Button */}
                            <div className="absolute top-6 right-6">
                              <div className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-[#1c1c1a] hover:text-[#ba1a1a] transition-colors shadow-sm cursor-pointer border border-[#e5e2df]">
                                <Heart className="w-4 h-4" />
                              </div>
                            </div>

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
                            <div className="space-y-3 flex-grow flex flex-col">
                              <div className="flex justify-between items-start gap-4">
                                <h3 className="text-xl font-headline font-bold leading-tight">{design.name}</h3>
                                <span className="text-lg font-body font-bold text-[#1c1c1a] whitespace-nowrap">{design.totalCost}</span>
                              </div>
                              <p className="text-sm text-[#44474c] line-clamp-2 leading-relaxed flex-grow">A masterclass in {design.style.toLowerCase()} luxury, focusing on spatial harmony and robust architectural detailing.</p>
                              <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest opacity-60 pt-3 border-t border-[#e5e2df] mt-auto">
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {design.time}</span>
                                <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5" /> {design.size}</span>
                              </div>
                            </div>
                          )}
                        </Link>
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
        </main>
      </div>
    </Layout>
  );
};

export default DesignsCatalog;
