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
    const mappedDbDesigns = (dbDesigns || []).map((dbD) => ({
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
        className="py-6 bg-background/80 backdrop-blur-xl border-b border-border sticky top-16 md:top-20 z-40"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search designs..."
                className="pl-12 h-12 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              className="md:hidden w-full h-12 rounded-2xl border-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-44 h-12 rounded-2xl bg-secondary/30 border-transparent">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="rounded-xl">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="w-44 h-12 rounded-2xl bg-secondary/30 border-transparent">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50">
                  <SelectItem value="all" className="rounded-xl">All Styles</SelectItem>
                  {styles.map((style) => (
                    <SelectItem key={style} value={style} className="rounded-xl">
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
                      className="rounded-full text-muted-foreground hover:text-destructive"
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
                className="md:hidden grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border overflow-hidden"
              >
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="rounded-xl bg-secondary/30">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="rounded-xl bg-secondary/30">
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="rounded-lg">All Styles</SelectItem>
                    {styles.map((style) => (
                      <SelectItem key={style} value={style} className="rounded-lg">
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
        <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] bg-background h-full flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.img
              src={design.image}
              alt={design.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.8 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <Badge className="bg-background/90 backdrop-blur-md text-foreground border-none px-3 py-1 rounded-full shadow-lg">
                {design.style}
              </Badge>
              {design.trending && (
                <Badge className="bg-destructive/90 backdrop-blur-md text-destructive-foreground border-none px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Trending
                </Badge>
              )}
            </div>

            <motion.div 
              className="absolute bottom-4 right-4 z-10"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
            >
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-xl">
                <ArrowRight className="w-6 h-6" />
              </div>
            </motion.div>
          </div>
          
          <CardContent className="p-8 flex-grow flex flex-col">
            <div className="mb-6">
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2 opacity-80">{design.category.replace("-", " ")}</p>
              <h3 className="font-extrabold text-foreground text-2xl group-hover:text-primary transition-colors leading-tight mb-2">
                {design.name}
              </h3>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                {design.size}
              </p>
            </div>

            <div className="space-y-4 text-sm bg-secondary/20 p-6 rounded-3xl mb-8 border border-transparent hover:border-primary/10 transition-all flex-grow">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Execution:</span>
                <span className="text-foreground font-bold">{design.executionCost}</span>
              </div>
              <div className="flex justify-between items-center text-xs opacity-80">
                <span className="text-muted-foreground">Materials + Labour:</span>
                <span className="text-foreground font-semibold">{design.materialsCost}</span>
              </div>
              <div className="pt-3 border-t border-border/50 flex justify-between items-center">
                <span className="text-foreground font-extrabold text-lg">Total Cost:</span>
                <span className="text-primary font-black text-xl">{design.totalCost}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button className="rounded-2xl h-12 font-bold shadow-lg" size="sm">
                View Details
              </Button>
              <Button variant="outline" size="sm" className="rounded-2xl h-12 font-bold border-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
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
