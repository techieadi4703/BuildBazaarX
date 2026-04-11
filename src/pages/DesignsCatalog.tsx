import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, SlidersHorizontal, X, ArrowRight, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadCaptureForm } from "@/components/shared/LeadCaptureForm";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion, AnimatePresence } from "framer-motion";
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
  { id: "office", name: "Office" },
];

const styles = ["Modern", "Luxury", "Minimal", "Traditional", "Contemporary"];

const designs = [
  {
    id: 1,
    name: "Modern L-Shape Kitchen",
    category: "kitchen",
    image: kitchenImage,
    size: "10x12 ft",
    style: "Modern",
    executionCost: "₹1,50,000",
    materialsCost: "₹80,000",
    customizeCost: "₹20,000",
    totalCost: "₹2,50,000",
    trending: true,
  },
  {
    id: 2,
    name: "Luxury Master Bedroom",
    category: "bedroom",
    image: bedroomImage,
    size: "14x16 ft",
    style: "Luxury",
    executionCost: "₹1,20,000",
    materialsCost: "₹70,000",
    customizeCost: "₹15,000",
    totalCost: "₹2,05,000",
    trending: true,
  },
  {
    id: 3,
    name: "Contemporary Living Room",
    category: "living-room",
    image: livingroomImage,
    size: "18x20 ft",
    style: "Contemporary",
    executionCost: "₹95,000",
    materialsCost: "₹55,000",
    customizeCost: "₹12,000",
    totalCost: "₹1,62,000",
    trending: false,
  },
  {
    id: 4,
    name: "Walk-in Wardrobe Design",
    category: "bedroom",
    image: wardrobeImage,
    size: "8x10 ft",
    style: "Modern",
    executionCost: "₹65,000",
    materialsCost: "₹45,000",
    customizeCost: "₹8,000",
    totalCost: "₹1,18,000",
    trending: false,
  },
  {
    id: 5,
    name: "Complete 2BHK Interior",
    category: "full-home",
    image: fullhomeImage,
    size: "850 sq ft",
    style: "Modern",
    executionCost: "₹3,50,000",
    materialsCost: "₹2,00,000",
    customizeCost: "₹50,000",
    totalCost: "₹6,00,000",
    trending: true,
  },
  {
    id: 6,
    name: "Minimal Kitchen Design",
    category: "kitchen",
    image: kitchenImage,
    size: "8x10 ft",
    style: "Minimal",
    executionCost: "₹1,00,000",
    materialsCost: "₹60,000",
    customizeCost: "₹15,000",
    totalCost: "₹1,75,000",
    trending: false,
  },
];

const DesignsCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: dbDesigns } = useQuery({
    queryKey: ['designs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('designs')
        .select('*, designers(full_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const allDesigns = useMemo(() => {
    const mappedDbDesigns = (dbDesigns || []).map((dbD: any) => ({
      id: `db-${dbD.id}`,
      name: dbD.name,
      category: dbD.category.toLowerCase().replace(" ", "-"),
      image: (dbD.images && dbD.images.length > 0) ? dbD.images[0] : "",
      size: dbD.room_size || "",
      style: dbD.style,
      executionCost: `₹${(dbD.execution_cost || 0).toLocaleString('en-IN')}`,
      materialsCost: `₹${(dbD.materials_cost || 0).toLocaleString('en-IN')}`,
      customizeCost: `₹${(dbD.customize_cost || 0).toLocaleString('en-IN')}`,
      totalCost: `₹${(dbD.total_cost || 0).toLocaleString('en-IN')}`,
      trending: dbD.is_trending || false,
    }));
    return [...designs, ...mappedDbDesigns];
  }, [dbDesigns]);

  const filteredDesigns = allDesigns.filter((design) => {
    const matchesCategory = selectedCategory === "all" || design.category === selectedCategory;
    const matchesStyle = selectedStyle === "all" || design.style === selectedStyle;
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStyle && matchesSearch;
  });

  const trendingDesigns = allDesigns.filter((d) => d.trending);

  return (
    <Layout>
      {/* Filters & Search */}
      <motion.section 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="py-6 bg-primary-container border-b border-white/10 sticky top-16 md:top-20 z-40"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
              <Input
                placeholder="Search designs..."
                className="pl-12 h-12 rounded-2xl bg-white/5 border-transparent text-white placeholder:text-white/40 focus:bg-white focus:text-black focus:ring-2 focus:ring-secondary/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              className="md:hidden w-full h-12 rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-44 h-12 rounded-2xl bg-white/5 border-transparent text-white hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-[#1A1A1A] text-white">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="rounded-xl hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="w-44 h-12 rounded-2xl bg-white/5 border-transparent text-white hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-[#1A1A1A] text-white">
                  <SelectItem value="all" className="rounded-xl hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">All Styles</SelectItem>
                  {styles.map((style) => (
                    <SelectItem key={style} value={style} className="rounded-xl hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <AnimatePresence>
                {(selectedCategory !== "all" || selectedStyle !== "all" || searchQuery) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedStyle("all");
                        setSearchQuery("");
                      }}
                      className="rounded-full text-white/50 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10 overflow-hidden"
              >
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="rounded-xl bg-white/5 border-transparent text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-[#1A1A1A] text-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-lg hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="rounded-xl bg-white/5 border-transparent text-white">
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-[#1A1A1A] text-white">
                    <SelectItem value="all" className="rounded-lg hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">All Styles</SelectItem>
                    {styles.map((style) => (
                      <SelectItem key={style} value={style} className="rounded-lg hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Trending Designs */}
      {trendingDesigns.length > 0 && (
        <section className="py-16 bg-background/50">
          <div className="container mx-auto px-4">
            <Reveal width="100%" direction="up" distance={30}>
              <div className="flex items-center gap-3 mb-10">
                <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Trending Collections</h2>
              </div>
            </Reveal>
            
            <Reveal width="100%" staggerChildren={0.1}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {trendingDesigns.map((design) => (
                  <RevealItem key={design.id}>
                    <DesignCard design={design} />
                  </RevealItem>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* All Designs */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up" distance={30}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Explore All Designs</h2>
                <p className="text-muted-foreground text-lg">Find the perfect layout for your dream space</p>
              </div>
              <Badge variant="outline" className="w-fit h-8 px-4 rounded-full text-base font-medium border-primary/20 bg-primary/5 text-primary">
                {filteredDesigns.length} designs discovered
              </Badge>
            </div>
          </Reveal>
          
          <AnimatePresence mode="popLayout">
            {filteredDesigns.length > 0 ? (
              <Reveal width="100%" staggerChildren={0.08}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredDesigns.map((design) => (
                    <RevealItem key={design.id}>
                      <DesignCard design={design} />
                    </RevealItem>
                  ))}
                </div>
              </Reveal>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-24 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border"
              >
                <div className="max-w-md mx-auto">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                  <p className="text-muted-foreground text-xl font-medium mb-8">No designs matching your requirements were found.</p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 h-14 border-2"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedStyle("all");
                      setSearchQuery("");
                    }}
                  >
                    Reset All Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decorative background shape */}
        <div className="absolute top-1/2 left-0 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      </section>

      {/* Lead Capture */}
      <div className="pb-16 bg-background">
        <LeadCaptureForm
          variant="hero"
          title="Found a design you love?"
          subtitle="Get a personalized consultation and a detailed cost estimate from our top interior designers."
        />
      </div>
    </Layout>
  );
};

interface DesignCardProps {
  design: {
    id: number | string;
    name: string;
    category: string;
    image: string;
    size: string;
    style: string;
    executionCost: string;
    materialsCost: string;
    customizeCost: string;
    totalCost: string;
    trending: boolean;
  };
}

const DesignCard = ({ design }: DesignCardProps) => {
  return (
    <Link to={`/designs/${design.id}`}>
      <motion.div
        whileHover={{ y: -12 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="h-full"
      >
        <Card className="group overflow-hidden border-black/5 hover:border-[#C5A572]/50 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-[#F4F0EA] h-full flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden bg-white">
            <motion.img
              src={design.image}
              alt={design.name}
              className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-all duration-500"
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.8 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-10">
              <Badge className="bg-white/80 backdrop-blur-md text-black border-none px-4 py-1.5 rounded-full shadow-sm font-bold text-[10px] uppercase tracking-widest">
                {design.style}
              </Badge>
              {design.trending && (
                <Badge className="bg-[#C5A572] text-white border-none px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  Trending
                </Badge>
              )}
            </div>

            <motion.div 
              className="absolute bottom-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-2xl">
                <ArrowRight className="w-7 h-7" />
              </div>
            </motion.div>
          </div>
          
          <CardContent className="p-10 flex-grow flex flex-col">
            <div className="mb-8">
              <p className="text-[#C5A572] font-black text-[10px] uppercase tracking-[0.3em] mb-3">{design.category.replace("-", " ")}</p>
              <h3 className="font-serif text-black text-3xl group-hover:text-[#C5A572] transition-colors leading-tight mb-4">
                {design.name}
              </h3>
              <div className="flex items-center gap-3 text-black/40 font-bold text-sm">
                <div className="w-2 h-2 rounded-full bg-[#C5A572]" />
                {design.size}
              </div>
            </div>

            <div className="space-y-4 text-sm bg-white p-8 rounded-[2.5rem] mb-10 border border-black/5 hover:border-[#C5A572]/30 transition-all flex-grow shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-black/40 font-bold uppercase tracking-widest text-[9px]">Execution Strategy</span>
                <span className="text-black font-black text-lg">{design.executionCost}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black/30 font-bold uppercase tracking-widest text-[9px]">Materials + Logistics</span>
                <span className="text-black/70 font-bold">{design.materialsCost}</span>
              </div>
              <div className="pt-5 border-t border-black/5 flex justify-between items-end mt-4">
                <div>
                  <span className="text-black/20 font-mono text-[9px] uppercase tracking-[0.3em] block mb-1">Total_Capital_Expenditure</span>
                  <span className="text-black font-black text-3xl tracking-tighter leading-none">{design.totalCost}</span>
                </div>
                <div className="text-[10px] font-mono text-[#C5A572] font-bold uppercase tracking-widest bg-[#C5A572]/5 px-3 py-1 rounded-lg">Verified</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button className="rounded-2xl h-16 font-black text-base shadow-xl bg-black text-white hover:bg-black/90 transition-all duration-300" size="lg">
                View Protocol
              </Button>
              <Button variant="outline" size="lg" className="rounded-2xl h-16 font-black text-base border-black/10 text-black hover:bg-black/5 transition-all duration-300">
                Customize
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default DesignsCatalog;
