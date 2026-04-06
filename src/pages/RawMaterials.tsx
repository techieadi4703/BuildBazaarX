import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Package, Truck, BadgeCheck, IndianRupee, ArrowRight, Star, ShoppingCart, Heart, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { motion, AnimatePresence } from "framer-motion";

// Fallback product images (used when image_url is null)
import plywoodImg from "@/assets/products/plywood.jpg";
import paintImg from "@/assets/products/paint.jpg";
import tilesImg from "@/assets/products/tiles.jpg";
import ledLightImg from "@/assets/products/led-light.jpg";
import showerImg from "@/assets/products/shower.jpg";
import cementImg from "@/assets/products/cement.jpg";
import laminateImg from "@/assets/products/laminate.jpg";
import switchesImg from "@/assets/products/switches.jpg";

// Map category → fallback image
const categoryFallbackImages: Record<string, string> = {
  wood: plywoodImg,
  paints: paintImg,
  tiles: tilesImg,
  electrical: ledLightImg,
  plumbing: showerImg,
  construction: cementImg,
  hardware: laminateImg,
};

// Map brand → fallback image (more specific than category)
const brandFallbackImages: Record<string, string> = {
  Greenlam: laminateImg,
  Merino: laminateImg,
  Anchor: switchesImg,
  Legrand: switchesImg,
  Havells: ledLightImg,
  Philips: ledLightImg,
};

function getProductImage(product: { image_url: string | null; brand: string | null; category: string | null }): string {
  if (product.image_url) return product.image_url;
  if (product.brand && brandFallbackImages[product.brand]) return brandFallbackImages[product.brand];
  if (product.category && categoryFallbackImages[product.category]) return categoryFallbackImages[product.category];
  return plywoodImg;
}

const categories = [
  { id: "wood", name: "Wood & Boards", icon: "🪵" },
  { id: "construction", name: "Construction Materials", icon: "🧱" },
  { id: "paints", name: "Paints & Finishes", icon: "🎨" },
  { id: "plumbing", name: "Plumbing & Sanitary", icon: "🚿" },
  { id: "electrical", name: "Electrical & Lighting", icon: "💡" },
  { id: "tiles", name: "Tiles & Flooring", icon: "🔲" },
  { id: "hardware", name: "Hardware & Accessories", icon: "🔩" },
];

const usps = [
  { icon: IndianRupee, title: "Best Market Price" },
  { icon: BadgeCheck, title: "100% Genuine Products" },
  { icon: Package, title: "Trusted Sellers" },
  { icon: Truck, title: "Fast Delivery" },
];

type Product = {
  id: number;
  name: string | null;
  brand: string | null;
  category: string | null;
  price: number | null;
  original_price: number | null;
  discount: number | null;
  rating: number | null;
  reviews: number | null;
  specs: string | null;
  in_stock: boolean;
  image_url: string | null;
};

const RawMaterials = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    material: "",
    quantity: "",
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

  const { data: regularProducts = [], isLoading: isLoadingRegular, isError: isErrorRegular } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: supplierProducts = [], isLoading: isLoadingSupplier, isError: isErrorSupplier } = useQuery({
    queryKey: ["supplier-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_products')
        .select(`*, suppliers(business_name)`)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const hashCode = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
      };

      return (data || []).map((dbProd: any) => ({
        id: hashCode(dbProd.id),
        name: dbProd.name,
        brand: dbProd.brand || (dbProd.suppliers ? dbProd.suppliers.business_name : null),
        category: dbProd.category,
        price: dbProd.price,
        original_price: dbProd.original_price,
        discount: dbProd.discount,
        rating: dbProd.rating,
        reviews: dbProd.total_reviews,
        specs: dbProd.specs,
        in_stock: dbProd.in_stock,
        image_url: dbProd.images && dbProd.images.length > 0 ? dbProd.images[0] : null,
      })) as Product[];
    }
  });

  const isLoading = isLoadingRegular || isLoadingSupplier;
  const isError = isErrorRegular || isErrorSupplier;
  
  const allProducts = [...regularProducts, ...supplierProducts];

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch =
      (product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name ?? "",
      brand: product.brand ?? "",
      image: getProductImage(product),
      price: product.price ?? 0,
      originalPrice: product.original_price ?? 0,
      specs: product.specs ?? "",
    });
    toast({
      title: "Added to Cart! 🛒",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name ?? "",
      brand: product.brand ?? "",
      image: getProductImage(product),
      price: product.price ?? 0,
      originalPrice: product.original_price ?? 0,
      specs: product.specs ?? "",
    });
    navigate("/checkout");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        message: `Material: ${formData.material} | Requirement: ${formData.quantity}`,
      });
      if (error) throw error;
      toast({
        title: "Quote Request Submitted!",
        description: "Our team will contact you with the best price within 24 hours.",
      });
      setFormData({ name: "", phone: "", city: "", material: "", quantity: "" });
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Search Bar */}
      <motion.section 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="py-12 bg-secondary/50 backdrop-blur-md"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl md:text-5xl font-extrabold text-center tracking-tight">Search Quality Materials</h1>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search for plywood, tiles, paints..."
                  className="pl-12 bg-background h-14 rounded-2xl border-none shadow-lg focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-14 px-10 rounded-2xl shadow-xl font-bold text-lg">
                Search
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* USPs */}
      <section className="py-6 bg-primary overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-wrap justify-center gap-8 md:gap-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {usps.map((usp, index) => (
              <motion.div 
                key={index} 
                className="flex items-center gap-3 text-primary-foreground/90 hover:text-white transition-colors cursor-default"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
              >
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <usp.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm tracking-wide uppercase">{usp.title}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section className="py-8 bg-background border-b border-border/50">
        <div className="container mx-auto px-4">
          <Reveal width="100%" direction="up" distance={20} staggerChildren={0.05}>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
              <RevealItem>
                <Button 
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="rounded-full px-8 shrink-0 h-11 font-bold"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Materials
                </Button>
              </RevealItem>
              {categories.map((cat) => (
                <RevealItem key={cat.id}>
                  <Button 
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    className="rounded-full px-8 shrink-0 h-11 font-bold flex items-center gap-2"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </Button>
                </RevealItem>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <Reveal direction="up">
              <div>
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
                  {selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name
                    : "Premium Materials Catalog"}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {isLoading ? "Fetching the best products for you..." : `${filteredProducts.length} high-quality products found`}
                </p>
              </div>
            </Reveal>
            <Reveal direction="up" delay={0.1}>
              <Select defaultValue="popular">
                <SelectTrigger className="w-56 h-12 rounded-2xl border-2">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="popular">Popularity</SelectItem>
                  <SelectItem value="low-high">Price: Low to High</SelectItem>
                  <SelectItem value="high-low">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                </SelectContent>
              </Select>
            </Reveal>
          </div>

          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-[2rem] border-border/50">
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : isError ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 bg-destructive/5 rounded-[3rem] border-2 border-dashed border-destructive/20"
              >
                <p className="text-destructive text-xl font-bold mb-2">System Error</p>
                <p className="text-muted-foreground">We couldn't load the catalog. Please try refreshing.</p>
              </motion.div>
            ) : (
              <Reveal width="100%" staggerChildren={0.05}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => (
                    <RevealItem key={product.id}>
                      <ProductCard product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
                    </RevealItem>
                  ))}
                  {filteredProducts.length === 0 && (
                    <motion.div 
                      className="col-span-full text-center py-24 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                      <p className="text-muted-foreground text-xl font-medium">No materials found in this category.</p>
                    </motion.div>
                  )}
                </div>
              </Reveal>
            )}
          </AnimatePresence>
        </div>
        
        {/* Decorative background shape */}
        <div className="absolute top-1/2 right-0 translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -z-10" />
      </section>

      {/* Bulk Order Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <motion.div 
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-3xl mx-auto">
            <Badge className="bg-white/20 text-white border-none px-4 py-1.5 rounded-full mb-6 font-bold uppercase tracking-widest text-xs">
              Exclusive Offer
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Bulk Orders? <br/>Get Extra Discounts!
            </h2>
            <p className="text-white/80 text-xl md:text-2xl mb-10 leading-relaxed">
              Special pricing for contractors, builders & large projects. Save up to <span className="text-white font-black underline decoration-accent underline-offset-4">30%</span> on wholesale orders.
            </p>
            <Button size="lg" variant="secondary" className="h-16 px-12 rounded-2xl text-xl font-bold shadow-2xl hover:scale-105 transition-transform group">
              Request Wholesale Quote
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </motion.div>
        
        {/* Animated background lines */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ backgroundImage: "linear-gradient(45deg, white 25%, transparent 25%, transparent 50%, white 50%, white 75%, transparent 75%, transparent)" , backgroundSize: "60px 60px" }}
        />
      </section>

      {/* Lead Form */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Reveal width="100%" direction="up">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                  Can't Find What You Need?
                </h2>
                <p className="text-muted-foreground text-xl">
                  Tell us your requirements and we'll source it for you at the best market price.
                </p>
              </div>
            </Reveal>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6 bg-background p-10 rounded-[2.5rem] border border-border/50 shadow-2xl"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="rounded-xl h-12 bg-secondary/30 border-transparent focus:bg-background focus:border-primary transition-all"
                    />
                  </div>
                </RevealItem>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="rounded-xl h-12 bg-secondary/30 border-transparent focus:bg-background focus:border-primary transition-all"
                    />
                  </div>
                </RevealItem>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">City</Label>
                    <Input
                      id="city"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="rounded-xl h-12 bg-secondary/30 border-transparent focus:bg-background focus:border-primary transition-all"
                    />
                  </div>
                </RevealItem>
                <RevealItem>
                  <div className="space-y-3">
                    <Label htmlFor="material" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Material Type</Label>
                    <Select
                      value={formData.material}
                      onValueChange={(value) => setFormData({ ...formData, material: value })}
                    >
                      <SelectTrigger id="material" className="rounded-xl h-12 bg-secondary/30 border-transparent">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </RevealItem>
              </div>
              <RevealItem>
                <div className="space-y-3">
                  <Label htmlFor="quantity" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Requirement Details</Label>
                  <Textarea
                    id="quantity"
                    placeholder="E.g., 100 sheets of 19mm Greenply plywood for modular kitchen..."
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    rows={4}
                    className="rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-primary transition-all"
                  />
                </div>
              </RevealItem>
              <RevealItem>
                <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-lg font-bold shadow-xl group overflow-hidden relative" disabled={isSubmitting}>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? "Submitting..." : "Get Exclusive Quote"}
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-primary-foreground/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </RevealItem>
            </motion.form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onBuyNow }: ProductCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] bg-background h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-secondary/30">
          <motion.img
            src={getProductImage(product)}
            alt={product.name ?? "Product"}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.8 }}
          />
          {/* Discount Badge */}
          {product.discount != null && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 left-4 z-10"
            >
              <Badge className="bg-destructive text-white border-none px-3 py-1 rounded-full shadow-lg font-bold text-xs ring-4 ring-destructive/20">
                {product.discount}% OFF
              </Badge>
            </motion.div>
          )}
          {/* Wishlist Button */}
          <motion.button 
            whileHover={{ scale: 1.25, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-muted-foreground hover:text-destructive transition-colors z-10"
          >
            <Heart className="w-5 h-5" />
          </motion.button>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <CardContent className="p-6 flex-grow flex flex-col">
          {/* Brand */}
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-2 opacity-80">{product.brand}</p>

          {/* Name */}
          <h3 className="font-extrabold text-foreground text-lg line-clamp-2 min-h-[56px] group-hover:text-primary transition-colors leading-tight mb-2">
            {product.name}
          </h3>

          {/* Specs */}
          <p className="text-xs text-muted-foreground font-medium mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            {product.specs}
          </p>

          <div className="flex items-center justify-between mt-auto mb-6">
            {/* Price */}
            <div className="flex flex-col">
              <span className="text-2xl font-black text-foreground">
                ₹{(product.price ?? 0).toLocaleString()}
              </span>
              {product.original_price != null && (
                <span className="text-sm text-muted-foreground line-through font-medium">
                  ₹{product.original_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Rating */}
            {product.rating != null && (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-green-600 text-green-600" />
                  {product.rating}
                </div>
                <span className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter">{(product.reviews ?? 0).toLocaleString()} Reviews</span>
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="bg-green-50/50 p-3 rounded-xl mb-6 flex items-center gap-2 group/delivery">
            <Truck className="w-4 h-4 text-green-600 group-hover/delivery:translate-x-1 transition-transform" />
            <span className="text-xs text-green-700 font-bold uppercase tracking-wider">Priority Home Delivery</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 rounded-xl h-11 font-bold shadow-lg shadow-primary/20"
              size="sm"
              onClick={() => onAddToCart(product)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
            </Button>
            <Button variant="outline" size="sm" className="flex-1 rounded-xl h-11 font-bold border-2" onClick={() => onBuyNow(product)}>
              Buy Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RawMaterials;
