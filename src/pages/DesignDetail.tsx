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
  Heart,
  BadgeCheck,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { DesignPricingCalculator } from "@/components/design-detail/DesignPricingCalculator";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion, AnimatePresence } from "framer-motion";
import { autoClassifyMaterial } from "@/lib/utils";
import { kitchenImage, bedroomImage, livingroomImage, wardrobeImage, fullhomeImage } from "@/lib/cdnImages";




const DesignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [dbDesign, setDbDesign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(id?.startsWith("db-") ? true : false);
  const [dbMaterials, setDbMaterials] = useState<any[]>([]);
  const { isInWishlist, addToWishlist, removeFromWishlist, isAuthenticated } = useWishlist();
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  
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

        const response = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        const profile = response.data as any;

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
        const response = await supabase
          .from('designs')
          .select('*, design_materials(*), designers(full_name, city, rating)')
          .eq('id', actualId)
          .single();
          
        const data = response.data as any;
        const error = response.error;

        if (error) throw error;

        if (data) {
          // Track views using sessionStorage to avoid multiple increments per session
          const viewedDesigns = JSON.parse(sessionStorage.getItem('viewedDesigns') || '[]');
          if (!viewedDesigns.includes(actualId)) {
            await supabase.from('designs').update({ view_count: (data.view_count || 0) + 1 }).eq('id', actualId);
            viewedDesigns.push(actualId);
            sessionStorage.setItem('viewedDesigns', JSON.stringify(viewedDesigns));
          }
          
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

  const design = dbDesign;

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

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save designs to your wishlist",
        variant: "destructive",
      });
      return;
    }
    
    // We use the URL param 'id' which preserves the 'db-' prefix if present, matching the Catalog.
    const wishlistId = id || design.id.toString();

    if (isInWishlist(wishlistId)) {
      removeFromWishlist(wishlistId);
      toast({
        title: "Removed from wishlist",
      });
    } else {
      addToWishlist({
        id: wishlistId,
        name: design.name,
        image: design.images[0],
        category: design.category,
        style: design.style
      });
      toast({
        title: "Added to wishlist",
      });
    }
  };

  const cartId = id || design.id.toString();
  const cartItem = cartItems.find((item) => item.id === cartId);
  const isInCart = !!cartItem;

  const handleCartToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCart) {
      updateQuantity(cartId, 0); // Remove from cart
      toast({
        title: "Removed from cart",
        description: `${design.name} has been removed from your cart.`,
      });
    } else {
      const added = addToCart({
        id: cartId,
        name: design.name,
        brand: "Design Blueprint",
        image: design.images[0],
        price: design.totalCost,
        originalPrice: design.totalCost,
        specs: `${design.size} • ${design.timeline} • ${design.style}`,
      });

      if (added) {
        toast({
          title: "Added to cart",
          description: `${design.name} has been added to your cart.`,
        });
      } else {
        toast({
          title: "Authentication Required",
          description: "Please log in to add items to your cart",
          variant: "destructive",
        });
      }
    }
  };

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
            className="inline-flex items-center text-sm font-bold text-[#44474c] hover:text-primary transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Catalog
          </Link>
        </div>
      </motion.div>

      <div className="w-full md:container md:mx-auto px-4 py-8 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-20 items-start">

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
                {!design.trending && (
                  <Badge className="absolute top-6 left-6 bg-white text-[#735c00] px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg border border-[#e5e2df] flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4" />
                    Verified Blueprint
                  </Badge>
                )}

                {/* Like Button */}
                <div className="absolute top-6 right-6 z-20">
                  <button 
                    type="button"
                    onClick={handleWishlistToggle}
                    className={`w-12 h-12 ${isInWishlist(id || design.id.toString()) ? 'bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/20' : 'bg-white/90 text-[#1c1c1a] border-[#e5e2df]'} backdrop-blur-md rounded-full flex items-center justify-center hover:text-[#ba1a1a] transition-all shadow-xl cursor-pointer border`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(id || design.id.toString()) ? 'fill-current' : ''}`} />
                  </button>
                </div>

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
                    <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </motion.button>
                ))}
              </div>

              {/* CTA Buttons moved to the left column to fill space */}
              <Reveal width="100%" direction="up" delay={0.4}>
                <div className="flex flex-col gap-4 mt-8">
                  <Button
                    size="lg"
                    variant={isInCart ? "outline" : "default"}
                    className={`w-full h-14 rounded-[2rem] text-base font-black shadow-2xl group relative overflow-hidden transition-all ${isInCart ? 'border-destructive text-destructive hover:bg-destructive/10' : 'shadow-primary/20 bg-foreground text-background hover:bg-foreground/90'}`}
                    onClick={handleCartToggle}
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {isInCart ? (
                        <>
                          <Trash2 className="w-5 h-5" />
                          Remove from Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          Add Blueprint to Cart
                        </>
                      )}
                    </div>
                  </Button>

                  <Button
                    size="lg"
                    className="w-full h-14 rounded-[2rem] text-base font-black shadow-2xl shadow-primary/20 group relative overflow-hidden"
                    onClick={() => {
                      const el = document.getElementById("consultation-form");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <Phone className="w-5 h-5 animate-pulse" />
                      Request Free Expert Consultation
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                    <motion.div 
                      className="absolute inset-0 bg-primary-foreground/10"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </Button>
                </div>
              </Reveal>
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
                    <span className="text-[#44474c] font-medium">({design.reviews} Reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/30 px-4 py-2 rounded-2xl border border-border/50">
                    <Ruler className="w-5 h-5 text-primary" />
                    <span className="text-foreground">{design.size} Area</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal width="100%" direction="up" delay={0.1}>
              <p className="text-[#44474c] text-lg leading-relaxed font-medium">
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#44474c] mb-1">{item.label}</p>
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
                    <span className="text-sm font-bold text-[#44474c] group-hover:text-foreground transition-colors">{feat}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdowns & Lists Removed */}

      {/* Raw Materials Required */}
      <AnimatePresence>
        {id?.startsWith("db-") && dbMaterials.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-4 bg-background"
          >
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-1">Inside the Build</h2>
                  <h3 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Bill of Materials</h3>
                </div>
                <Badge variant="secondary" className="px-6 py-2 rounded-full font-bold h-fit border border-border">
                  {dbMaterials.length} Standard Items Required
                </Badge>
              </div>
              
              
              <div className="overflow-x-auto rounded-[3rem] border border-border/50 bg-background shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-primary/5 text-muted-foreground border-b border-primary/10">
                    <tr>
                      <th className="px-4 py-3 font-black uppercase tracking-widest text-[10px]">Material Name</th>
                      <th className="px-4 py-3 font-black uppercase tracking-widest text-[10px]">Category</th>
                      <th className="px-4 py-3 font-black uppercase tracking-widest text-[10px]">Quantity</th>
                      <th className="px-4 py-3 font-black uppercase tracking-widest text-[10px] text-right">Est. Market Price</th>
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
                        <td className="px-4 py-3 font-bold text-foreground group-hover:text-primary transition-colors">{mat.material_name}</td>
                        <td className="px-4 py-3 font-medium text-muted-foreground italic text-sm">{mat.category || autoClassifyMaterial(mat.material_name)}</td>
                        <td className="px-4 py-3">
                           <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/10 font-bold bg-primary/5 text-primary">{mat.quantity} {mat.unit}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-black text-foreground">
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
      <section id="consultation-form" className="py-8 bg-secondary/20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <Reveal width="100%" direction="up">
              <div className="text-center mb-6">
                <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Final Step</h2>
                <h3 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">Your Dream, Crafted.</h3>
                <p className="text-[#44474c] text-xl font-medium max-w-2xl mx-auto">
                  Share your vision with us and let our expert team bring it to life with precision and luxury.
                </p>
              </div>
            </Reveal>

            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-[0_40px_100px_rgba(0,0,0,0.15)] border-none rounded-[4rem] overflow-hidden bg-background">
                <div className="bg-primary px-8 py-6 flex flex-col items-center text-center text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tight mb-1">Technical Feasibility Brief</h3>
                    <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">No commitment consultation call</p>
                  </div>
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="consult-name" className="text-sm font-bold uppercase tracking-widest text-[#44474c] ml-1">Full Name</Label>
                        <Input
                          id="consult-name"
                          name="name"
                          autoComplete="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your preferred name"
                          className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-[#74777d]/70 text-[#1c1c1a]"
                        />
                      </div>
                    </RevealItem>
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="consult-phone" className="text-sm font-bold uppercase tracking-widest text-[#44474c] ml-1">Mobile Access</Label>
                        <Input
                          id="consult-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91"
                          className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-[#74777d]/70 text-[#1c1c1a]"
                        />
                      </div>
                    </RevealItem>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="consult-city" className="text-sm font-bold uppercase tracking-widest text-[#44474c] ml-1">Site Location</Label>
                        <Input
                          id="consult-city"
                          name="city"
                          autoComplete="address-level2"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Project city"
                          className="h-14 rounded-2xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:text-[#74777d]/70 text-[#1c1c1a]"
                        />
                      </div>
                    </RevealItem>
                    <RevealItem>
                      <div className="space-y-3">
                        <Label htmlFor="consult-project" className="text-sm font-bold uppercase tracking-widest text-[#44474c] ml-1">Configuration</Label>
                        <select
                          id="consult-project"
                          value={formData.projectType}
                          onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                          className={`flex h-14 w-full rounded-2xl bg-secondary/30 border-transparent px-4 py-2 text-sm font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer ${formData.projectType === "" ? "text-[#74777d]/70" : "text-[#1c1c1a]"}`}
                        >
                          <option value="" disabled hidden>Specific Category</option>
                          <option value="Kitchen" className="text-[#1c1c1a]">Modern Kitchen</option>
                          <option value="Bedroom" className="text-[#1c1c1a]">Bespoke Bedroom</option>
                          <option value="Living Room" className="text-[#1c1c1a]">Premium Living Lounge</option>
                          <option value="Full Home" className="text-[#1c1c1a]">End-to-End Home</option>
                          <option value="Other" className="text-[#1c1c1a]">Custom Project</option>
                        </select>
                      </div>
                    </RevealItem>
                  </div>

                  <RevealItem>
                    <div className="space-y-3">
                      <Label htmlFor="consult-message" className="text-sm font-bold uppercase tracking-widest text-[#44474c] ml-1">Design Aspirations</Label>
                      <Textarea
                        id="consult-message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us everything — materials preferences, timeline constraints, or aesthetic inspiration..."
                        rows={4}
                        className="rounded-3xl bg-secondary/30 border-transparent focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold pt-4 px-4 placeholder:text-[#74777d]/70 text-[#1c1c1a]"
                      />
                    </div>
                  </RevealItem>

                  <RevealItem>
                    <Button
                      size="lg"
                      className="w-full h-14 rounded-[2rem] font-black text-base shadow-[0_20px_50px_rgba(0,0,0,0.15)] group relative overflow-hidden"
                      onClick={handleSubmit}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
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
