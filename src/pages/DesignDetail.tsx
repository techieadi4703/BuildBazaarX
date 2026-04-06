import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Shield,
  Star,
  Ruler,
  Phone,
  MessageCircle,
  Sparkles,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { DesignPricingCalculator } from "@/components/design-detail/DesignPricingCalculator";
import { ExecutionCostBreakdown } from "@/components/design-detail/ExecutionCostBreakdown";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion, AnimatePresence } from "framer-motion";

import kitchenImage from "@/assets/kitchen-design.jpg";
import bedroomImage from "@/assets/bedroom-design.jpg";
import livingroomImage from "@/assets/livingroom-design.jpg";
import wardrobeImage from "@/assets/wardrobe-design.jpg";
import fullhomeImage from "@/assets/fullhome-design.jpg";

const designsData = {
  "1": {
    id: 1,
    name: "Modern L-Shape Kitchen",
    category: "Kitchen",
    style: "Modern",
    size: "10x12 ft",
    images: [kitchenImage, bedroomImage, livingroomImage],
    description:
      "Transform your cooking space with our Modern L-Shape Kitchen design. This layout maximizes corner space while providing ample storage and counter area. Perfect for medium to large kitchens, featuring sleek handleless cabinets, premium countertops, and integrated appliances.",
    features: [
      "Soft-close drawers and cabinets",
      "Modular design for easy customization",
      "Built-in chimney space",
      "Dedicated appliance zones",
      "Under-cabinet LED lighting",
      "Pull-out pantry units",
    ],
    executionCost: 150000,
    materialsCost: 80000,
    customizeCost: 20000,
    totalCost: 250000,
    timeline: "25–30 days",
    warranty: "10 Years",
    rating: 4.8,
    reviews: 124,
    trending: true,
  },
  "2": {
    id: 2,
    name: "Luxury Master Bedroom",
    category: "Bedroom",
    style: "Luxury",
    size: "14x16 ft",
    images: [bedroomImage, wardrobeImage, livingroomImage],
    description:
      "Create your personal sanctuary with our Luxury Master Bedroom design. Featuring elegant bed back paneling, spacious wardrobes, and ambient lighting that sets the perfect mood.",
    features: [
      "Designer bed back panel",
      "Built-in reading lights",
      "Hidden storage solutions",
      "Premium veneer finish",
      "Integrated side tables",
      "Accent wall design",
    ],
    executionCost: 120000,
    materialsCost: 70000,
    customizeCost: 15000,
    totalCost: 205000,
    timeline: "20–25 days",
    warranty: "10 Years",
    rating: 4.9,
    reviews: 89,
    trending: true,
  },
  "3": {
    id: 3,
    name: "Contemporary Living Room",
    category: "Living Room",
    style: "Contemporary",
    size: "18x20 ft",
    images: [livingroomImage, kitchenImage, fullhomeImage],
    description:
      "Make a lasting impression with our Contemporary Living Room design. This space-efficient layout features a stunning TV unit, elegant storage solutions, and a cohesive design language.",
    features: [
      "Wall-mounted TV unit",
      "Display shelving system",
      "Hidden cable management",
      "Accent wall paneling",
      "Floating console design",
      "Integrated bar unit option",
    ],
    executionCost: 95000,
    materialsCost: 55000,
    customizeCost: 12000,
    totalCost: 162000,
    timeline: "15–20 days",
    warranty: "10 Years",
    rating: 4.7,
    reviews: 156,
    trending: false,
  },
  "4": {
    id: 4,
    name: "Walk-in Wardrobe Design",
    category: "Bedroom",
    style: "Modern",
    size: "8x10 ft",
    images: [wardrobeImage, bedroomImage, livingroomImage],
    description:
      "Organize your wardrobe in style with our Walk-in Wardrobe design. Maximize storage with dedicated zones for different clothing types, accessories, and footwear.",
    features: [
      "Zone-based organization",
      "Pull-out accessory trays",
      "Full-length mirror",
      "Shoe rack system",
      "Dedicated saree/suit storage",
      "Motion sensor lighting",
    ],
    executionCost: 65000,
    materialsCost: 45000,
    customizeCost: 8000,
    totalCost: 118000,
    timeline: "12–15 days",
    warranty: "10 Years",
    rating: 4.6,
    reviews: 67,
    trending: false,
  },
  "5": {
    id: 5,
    name: "Complete 2BHK Interior",
    category: "Full Home",
    style: "Modern",
    size: "850 sq ft",
    images: [fullhomeImage, kitchenImage, bedroomImage, livingroomImage, wardrobeImage],
    description:
      "Get your entire home designed with our Complete 2BHK Interior package covering living room, 2 bedrooms, modular kitchen, and all storage needs with a cohesive design theme.",
    features: [
      "Complete home solution",
      "Unified design language",
      "All rooms covered",
      "Storage optimization",
      "Electrical planning included",
      "Color consultation",
    ],
    executionCost: 350000,
    materialsCost: 200000,
    customizeCost: 50000,
    totalCost: 600000,
    timeline: "45–60 days",
    warranty: "10 Years",
    rating: 4.9,
    reviews: 203,
    trending: true,
  },
  "6": {
    id: 6,
    name: "Minimal Kitchen Design",
    category: "Kitchen",
    style: "Minimal",
    size: "8x10 ft",
    images: [kitchenImage, livingroomImage, bedroomImage],
    description:
      "Embrace simplicity with our Minimal Kitchen Design. Clean lines, clutter-free surfaces, and efficient storage define this modern kitchen for those who appreciate 'less is more'.",
    features: [
      "Handleless cabinets",
      "Integrated appliances",
      "Hidden storage",
      "Clean countertops",
      "Neutral color palette",
      "Maximum functionality",
    ],
    executionCost: 100000,
    materialsCost: 60000,
    customizeCost: 15000,
    totalCost: 175000,
    timeline: "20–25 days",
    warranty: "10 Years",
    rating: 4.7,
    reviews: 92,
    trending: false,
  },
};

const DesignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [dbDesign, setDbDesign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(id?.startsWith("db-") ? true : false);
  const [dbMaterials, setDbMaterials] = useState<any[]>([]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    projectType: "",
    message: "",
  });

  useEffect(() => {
    const prefillData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata?.full_name || prev.name,
        }));

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: profile.full_name || prev.name,
            phone: profile.phone || prev.phone,
            city: profile.city || prev.city,
          }));
        }
      }
    };
    prefillData();
  }, []);

  useEffect(() => {
    const fetchDbDesign = async () => {
      if (!id?.startsWith("db-")) return;
      
      const actualId = id.replace("db-", "");
      
      try {
        const { data, error } = await supabase
          .from('designs')
          .select('*, design_materials(*), designers(full_name, city, rating)')
          .eq('id', actualId)
          .single();

        if (error) throw error;

        if (data) {
          await supabase.from('designs').update({ view_count: (data.view_count || 0) + 1 }).eq('id', actualId);
          
          setDbDesign({
            id: actualId,
            name: data.name,
            category: data.category,
            style: data.style,
            size: data.room_size || "N/A",
            images: data.images || [],
            description: data.description,
            features: data.features || [],
            executionCost: data.execution_cost,
            materialsCost: data.materials_cost,
            customizeCost: data.customize_cost || 0,
            totalCost: data.total_cost,
            timeline: data.timeline || "N/A",
            warranty: data.warranty || "N/A",
            rating: data.rating || 0,
            reviews: data.total_reviews || 0,
            trending: data.is_trending || false,
            designer: data.designers
          });
          setDbMaterials(data.design_materials || []);
        }
      } catch (err) {
        console.error("Error fetching design:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDbDesign();
  }, [id]);

  if (isLoading) {
    return <Layout><div className="flex justify-center items-center h-[70vh]"><Zap className="w-8 h-8 animate-pulse text-primary" /></div></Layout>;
  }

  const hardcodedDesign = id && !id.startsWith("db-") ? designsData[id as keyof typeof designsData] : null;
  const design = dbDesign || hardcodedDesign;

  if (!design) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <h1 className="text-4xl font-black text-foreground mb-4">Design Not Found</h1>
            <p className="text-muted-foreground mb-10 text-lg">We couldn't track down the design you're looking for.</p>
            <Button asChild size="lg" className="rounded-2xl">
              <Link to="/designs">Explore All Designs</Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Please fill required fields",
        description: "Name and phone number are required.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Consultation Request Sent! ✨",
      description: "Our high-end experts will reach out within 24 hours.",
    });
    setFormData({ name: "", phone: "", city: "", projectType: "", message: "" });
  };

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % design.images.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + design.images.length) % design.images.length);

  return (
    <Layout>
      {/* Breadcrumb Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-secondary/30 border-b border-border/50 py-4"
      >
        <div className="container mx-auto px-4">
          <Link
            to="/designs"
            className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Catalog
          </Link>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* LEFT: Image Gallery */}
          <Reveal width="100%" direction="up">
            <div className="space-y-6">
              {/* Main Image Slider */}
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-secondary shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={design.images[currentImageIndex]}
                    alt={design.name}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                {design.trending && (
                  <Badge className="absolute top-6 left-6 bg-destructive text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">
                    🔥 Hottest Trend
                  </Badge>
                )}

                {/* Navigation Arrows */}
                {design.images.length > 1 && (
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={prevImage}
                      className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl text-foreground hover:bg-primary hover:text-white transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextImage}
                      className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl text-foreground hover:bg-primary hover:text-white transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.button>
                  </div>
                )}

                {/* Dots indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {design.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`h-2.5 rounded-full transition-all duration-500 bg-white shadow-lg ${
                        i === currentImageIndex ? "w-8 opacity-100" : "w-2.5 opacity-40 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Thumbnails grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {design.images.map((img, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${
                      index === currentImageIndex
                        ? "border-primary shadow-xl ring-4 ring-primary/20"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* RIGHT: Design Details */}
          <div className="space-y-10">
            <Reveal width="100%" direction="up">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
                    {design.category}
                  </Badge>
                  <Badge variant="outline" className="px-4 py-1 rounded-full border-accent/20 text-accent font-black uppercase tracking-widest text-[10px]">
                    {design.style} Style
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight tracking-tight">
                  {design.name}
                </h1>
                <div className="flex flex-wrap items-center gap-8 text-sm font-bold">
                  <div className="flex items-center gap-2 bg-accent/5 px-4 py-2 rounded-2xl border border-accent/10">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="text-foreground text-lg">{design.rating}</span>
                    <span className="text-muted-foreground font-medium">({design.reviews} Reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/30 px-4 py-2 rounded-2xl border border-border/50">
                    <Ruler className="w-5 h-5 text-primary" />
                    <span className="text-foreground">{design.size} Area</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal width="100%" direction="up" delay={0.1}>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                {design.description}
              </p>
            </Reveal>

            {/* Quick Metrics Grid */}
            <Reveal width="100%" staggerChildren={0.1} delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { icon: Clock, label: "Est. Timeline", value: design.timeline },
                  { icon: Shield, label: "Brand Warranty", value: design.warranty },
                  { icon: Check, label: "Material Grade", value: "Premium Plus" }
                ].map((item, idx) => (
                  <RevealItem key={idx}>
                    <div className="p-6 bg-secondary/20 rounded-[2rem] border border-border/50 hover:border-primary/20 transition-all text-center">
                      <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p>
                      <p className="font-black text-foreground text-sm">{item.value}</p>
                    </div>
                  </RevealItem>
                ))}
              </div>
            </Reveal>

            {/* Features list interactive */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-primary/80 mb-6">Execution Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {design.features.map((feat, idx) => (
                  <motion.div 
                    key={feat} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/40 hover:border-primary/20 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{feat}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Cost Summary Card Premium */}
            <Reveal width="100%" direction="up" delay={0.3}>
              <Card className="border-border/50 shadow-2xl rounded-[3rem] overflow-hidden bg-background">
                <div className="bg-primary px-8 py-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-white" />
                  <h3 className="font-black text-white text-lg uppercase tracking-tight">Investment Summary</h3>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-center group">
                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Standard Execution</span>
                    <span className="font-black text-foreground text-lg group-hover:text-primary transition-colors">
                      ₹{design.executionCost.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Standard Materials</span>
                    <span className="font-black text-foreground text-lg group-hover:text-primary transition-colors">
                      ₹{design.materialsCost.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Estimated Total Price</p>
                      <p className="font-black text-primary text-4xl tracking-tighter">
                        ₹{design.totalCost.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100 hidden sm:block">
                      <p className="text-[10px] font-black text-green-700 uppercase tracking-tighter">EMI Starting at</p>
                      <p className="font-black text-green-800">₹{(Math.round(design.totalCost / 24)).toLocaleString()} / mo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            {/* CTA Button */}
            <Reveal width="100%" direction="up" delay={0.4}>
              <Button
                size="lg"
                className="w-full h-20 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/20 group relative overflow-hidden"
                onClick={() => {
                  const el = document.getElementById("consultation-form");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Phone className="w-6 h-6 animate-pulse" />
                  Request Free Expert Consultation
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </div>
                <motion.div 
                  className="absolute inset-0 bg-primary-foreground/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Breakdowns & Lists */}
      <section className="py-20 bg-secondary/10">
        <Reveal width="100%" direction="up">
          <ExecutionCostBreakdown />
        </Reveal>
      </section>

      {/* Raw Materials Required */}
      <AnimatePresence>
        {id?.startsWith("db-") && dbMaterials.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-24 bg-background"
          >
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Inside the Build</h2>
                  <h3 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Bill of Materials</h3>
                </div>
                <Badge variant="secondary" className="px-6 py-2 rounded-full font-bold h-fit border border-border">
                  {dbMaterials.length} Standard Items Required
                </Badge>
              </div>
              
              <div className="overflow-hidden rounded-[3rem] border border-border/50 bg-background shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-primary/5 text-muted-foreground border-b border-primary/10">
                    <tr>
                      <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px]">Material Name</th>
                      <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px]">Category</th>
                      <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px]">Quantity</th>
                      <th className="px-10 py-6 font-black uppercase tracking-widest text-[10px] text-right">Est. Market Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {dbMaterials.map((mat, idx) => (
                      <motion.tr 
                        key={mat.id} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="hover:bg-secondary/20 transition-all group"
                      >
                        <td className="px-10 py-6 font-bold text-foreground group-hover:text-primary transition-colors">{mat.material_name}</td>
                        <td className="px-10 py-6 font-medium text-muted-foreground italic text-sm">{mat.category || '-'}</td>
                        <td className="px-10 py-6">
                           <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/10 font-bold bg-primary/5 text-primary">{mat.quantity} {mat.unit}</Badge>
                        </td>
                        <td className="px-10 py-6 text-right font-black text-foreground">
                          {mat.estimated_cost ? `₹${mat.estimated_cost.toLocaleString('en-IN')}` : 'Market Rates'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!id?.startsWith("db-") && <DesignPricingCalculator />}

      {/* Consultation Form Form Section */}
      <section id="consultation-form" className="py-24 bg-secondary/20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <Reveal width="100%" direction="up">
              <div className="text-center mb-16">
                <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Final Step</h2>
                <h3 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">Your Dream, Crafted.</h3>
                <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">
                  Share your vision with us and let our expert team bring it to life with precision and luxury.
                </p>
              </div>
            </Reveal>

            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-[0_40px_100px_rgba(0,0,0,0.15)] border-none rounded-[4rem] overflow-hidden bg-background">
                <div className="bg-primary p-12 flex flex-col items-center text-center text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <MessageCircle className="w-16 h-16 mb-6 opacity-80" />
                    <h3 className="text-2xl font-black tracking-tight mb-2">Technical Feasibility Brief</h3>
                    <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">No commitment consultation call</p>
                  </div>
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
                </div>
                <CardContent className="p-12 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="consult-name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                        <Input
                          id="consult-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your preferred name"
                          className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                      </div>
                    </RevealItem>
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="consult-phone" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Mobile Access</Label>
                        <Input
                          id="consult-phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91"
                          className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                      </div>
                    </RevealItem>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="consult-city" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Site Location</Label>
                        <Input
                          id="consult-city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Project city"
                          className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                      </div>
                    </RevealItem>
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="consult-project" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Configuration</Label>
                        <select
                          id="consult-project"
                          value={formData.projectType}
                          onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                          className="flex h-14 w-full rounded-2xl bg-secondary/30 border-transparent px-4 py-2 text-sm font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Specific Category</option>
                          <option value="Kitchen">Modern Kitchen</option>
                          <option value="Bedroom">Bespoke Bedroom</option>
                          <option value="Living Room">Premium Living Lounge</option>
                          <option value="Full Home">End-to-End Home</option>
                          <option value="Other">Custom Project</option>
                        </select>
                      </div>
                    </RevealItem>
                  </div>

                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="consult-message" className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Design Aspirations</Label>
                      <Textarea
                        id="consult-message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us everything — materials preferences, timeline constraints, or aesthetic inspiration..."
                        rows={4}
                        className="rounded-3xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold pt-4 px-4"
                      />
                    </div>
                  </RevealItem>

                  <RevealItem>
                    <Button
                      size="lg"
                      className="w-full h-20 rounded-[2rem] font-black text-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] group relative overflow-hidden"
                      onClick={handleSubmit}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        Initiate Free Consultation
                      </span>
                      <motion.div 
                        className="absolute inset-0 bg-primary-foreground/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    </Button>
                    <p className="text-[10px] text-muted-foreground font-black text-center mt-6 uppercase tracking-widest opacity-50">
                      Standard response time: &lt; 4 business hours
                    </p>
                  </RevealItem>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decorative patterns */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] translate-x-1/2" />
      </section>
    </Layout>
  );
};

export default DesignDetail;
