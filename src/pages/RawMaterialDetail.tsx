
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Share2,
  CheckCircle2,
  BadgeCheck,
  Zap,
  Copy,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  MoreHorizontal
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { allProducts, getProductImage, Product } from "@/lib/rawMaterialsData";
import { Reveal } from "@/components/shared/Reveal";

const RawMaterialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      // 1. Try static data first
      const foundProduct = allProducts.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setIsLoading(false);
        return;
      }

      // 2. Try Supabase if not in static list
      try {
        const { data, error } = await supabase
          .from("supplier_products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        const typedData = data as any;

        if (typedData && !error) {
          setProduct({
            id: typedData.id,
            supplier_id: typedData.supplier_id,
            name: typedData.name,
            brand: typedData.brand,
            category: typedData.category,
            price: typedData.price,
            original_price: typedData.original_price,
            discount: typedData.discount,
            rating: 4.5,
            reviews: 128,
            specs: typedData.specs,
            in_stock: (typedData.stock_qty || 0) > 0,
            image_url: typedData.images && typedData.images.length > 0 ? typedData.images[0] : null,
            images: typedData.images || [],
            return_policy: typedData.return_policy,
            quality_details: typedData.quality_details,
            description: typedData.description
          });
        }
      } catch (err) {
        console.error("Error fetching supplier product:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <Zap className="w-8 h-8 animate-pulse text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-black mb-4">Material Not Found</h1>
          <p className="text-muted-foreground mb-10 text-lg">We couldn't track down the material you're looking for.</p>
          <Button asChild size="lg" className="rounded-2xl">
            <Link to="/materials">Explore Catalog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [getProductImage(product)];

  const cartItem = cartItems.find((item) => item.id === product.id);
  const isInCart = !!cartItem;

  const handleCartAction = () => {
    if (isInCart) {
      navigate("/checkout");
    } else {
      const added = addToCart({
        id: product.id,
        name: product.name ?? "Raw Material",
        brand: product.brand ?? "Unknown",
        image: getProductImage(product),
        price: product.price ?? 0,
        originalPrice: product.original_price ?? product.price ?? 0,
        specs: product.specs ?? "",
      });

      if (added) {
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });
      } else {
        toast({
          title: "Authentication Required",
          description: "Please log in as a customer to add items to your cart",
          variant: "destructive",
        });
        navigate("/auth?mode=login");
      }
    }
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const shareToPlatform = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out this ${product.name} from ${product.brand} on BuildBazaarX!`;
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "native":
        if (navigator.share) {
          try {
            await navigator.share({ title: product.name ?? "", text, url });
            return;
          } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') console.error(err);
          }
        }
        // Fallback to copy if native fails or unavailable
        platform = "copy";
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    } else if (platform === "copy") {
      await navigator.clipboard.writeText(url);
      toast({ 
        title: "Link copied! 📋",
        description: "Paste it anywhere to share." 
      });
    }
    setIsShareModalOpen(false);
  };

  const ShareContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-y-8 gap-x-4 py-2">
        <button 
          onClick={() => shareToPlatform("whatsapp")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all shadow-sm border border-green-500/20 backdrop-blur-sm">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">WhatsApp</span>
        </button>
        <button 
          onClick={() => shareToPlatform("facebook")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-[#1877F2] flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all shadow-sm border border-blue-500/20 backdrop-blur-sm">
            <Facebook className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Facebook</span>
        </button>
        <button 
          onClick={() => shareToPlatform("twitter")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-foreground flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all shadow-sm border border-white/20 backdrop-blur-sm">
            <Twitter className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Twitter</span>
        </button>
        <button 
          onClick={() => shareToPlatform("linkedin")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-[#0A66C2] flex items-center justify-center group-hover:bg-[#0A66C2] group-hover:text-white transition-all shadow-sm border border-blue-500/20 backdrop-blur-sm">
            <Linkedin className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">LinkedIn</span>
        </button>
        <button 
          onClick={() => shareToPlatform("native")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 dark:group-hover:bg-amber-400 group-hover:text-white dark:group-hover:text-black transition-all shadow-sm border border-amber-500/25 backdrop-blur-sm">
            <MoreHorizontal className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">More</span>
        </button>
        <button 
          onClick={() => shareToPlatform("copy")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-foreground flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all shadow-sm border border-white/20 backdrop-blur-sm">
            <Copy className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Copy Link</span>
        </button>
      </div>
      <div className="bg-white/20 dark:bg-white/5 p-3 rounded-2xl border border-white/20 flex items-center justify-between backdrop-blur-sm">
        <span className="text-[10px] font-bold text-muted-foreground truncate mr-4 italic">{window.location.href}</span>
        <Button variant="ghost" size="sm" className="font-black text-primary uppercase text-[10px] tracking-widest h-8 hover:bg-white/20 dark:hover:bg-white/10" onClick={() => shareToPlatform("copy")}>
          Copy
        </Button>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Navigation Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-subtle border-b border-white/20 py-4 sticky top-0 z-30"
      >
        <div className="container mx-auto px-4">
          <Link
            to="/materials"
            className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="w-8 h-8 rounded-full glass flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Raw Materials
          </Link>
        </div>
      </motion.div>

      <div className="container mx-auto px-5 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/10 dark:bg-black/20 border border-white/20 shadow-glass group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={product.name ?? ""}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-contain p-8 md:p-12"
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass hover:bg-white/40 dark:hover:bg-white/20 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass hover:bg-white/40 dark:hover:bg-white/20 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 rounded-full glass shadow-xl flex items-center justify-center hover:text-primary hover:scale-110 active:scale-95 transition-all"
                  title="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      idx === currentImageIndex ? "border-primary shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <Reveal width="100%" direction="up">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    {product.brand}
                  </Badge>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {product.rating}
                    <span className="text-muted-foreground font-medium ml-1">({product.reviews} reviews)</span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                  {product.name}
                </h1>
                
                <p className="text-muted-foreground font-medium text-lg italic">
                  {product.specs}
                </p>
              </div>
            </Reveal>

            <Reveal width="100%" direction="up" delay={0.1}>
              <div className="glass-panel p-4 md:p-8 space-y-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black text-foreground">₹{product.price?.toLocaleString()}</span>
                  {product.original_price && product.original_price > (product.price ?? 0) && (
                    <>
                      <span className="text-xl text-muted-foreground line-through font-bold">₹{product.original_price.toLocaleString()}</span>
                      <span className="text-green-600 dark:text-green-400 font-black text-sm uppercase tracking-wider bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                        {Math.round(((product.original_price - (product.price ?? 0)) / product.original_price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="flex items-center gap-2 md:gap-3 text-sm font-bold text-foreground/80">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p>Express Delivery</p>
                      <p className="text-[10px] uppercase text-muted-foreground tracking-tighter">In 2-4 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-sm font-bold text-foreground/80">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <p>{product.return_policy || "7 Days Replacement"}</p>
                      <p className="text-[10px] uppercase text-muted-foreground tracking-tighter">
                        {product.return_policy === "No Returns" ? "Final Sale" : "Hassle-free returns"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10 dark:bg-white/5" />

                <div className="flex items-center gap-2">
                  {isInCart ? (
                    <div className="flex items-center bg-white/20 dark:bg-white/5 border border-white/25 rounded-2xl p-1 shadow-sm shrink-0 backdrop-blur-sm">
                      <button 
                        onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                        className="w-8 h-9 md:h-[54px] md:w-12 flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-black text-lg text-foreground">{cartItem.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        className="w-8 h-9  md:h-[54px] md:w-12 flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}

                  <Button 
                    onClick={handleCartAction}
                    size="lg" 
                    className={`flex-1 h-11 md:h-16 rounded-2xl text-base md:text-lg font-black transition-all shadow-lg ${
                      isInCart ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    {isInCart ? "Checkout Now" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </Reveal>

            {/* Product Details Tabs / Sections */}
            <div className="space-y-8">
              <Reveal width="100%" direction="up" delay={0.2}>
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Technical Excellence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.quality_details ? product.quality_details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 glass-card">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="text-sm font-bold text-foreground">{detail}</span>
                      </div>
                    )) : (
                      <>
                        <div className="flex items-center gap-3 p-4 glass-card">
                          <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-sm font-bold text-foreground">Verified Quality</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 glass-card">
                          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-sm font-bold text-foreground">Manufacturer Warranty</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Reveal>

              <Reveal width="100%" direction="up" delay={0.3}>
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">About this Product</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {product.description || `This high-quality ${product.name} from ${product.brand} is specifically chosen for its durability and performance in modern construction projects. Meeting all industry standards, it ensures a premium finish and long-lasting results for your build.`}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <section className="mt-24 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-2">Build Better</h2>
              <h3 className="text-3xl font-black text-foreground tracking-tight">Similar Materials</h3>
            </div>
            <Button variant="ghost" asChild className="font-black text-primary hover:bg-primary/5">
              <Link to="/materials">View All <ChevronRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {allProducts
              .filter(p => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map(p => (
                <Link key={p.id} to={`/materials/${p.id}`} className="group">
                  <div className="glass-card aspect-square mb-4 overflow-hidden p-6 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--glass-shadow-lg)]">
                    <img 
                      src={getProductImage(p)} 
                      alt={p.name ?? ""} 
                      className="w-full h-full object-contain dark:brightness-95 group-hover:scale-110 transition-transform" 
                    />
                  </div>
                  <h4 className="font-bold text-foreground line-clamp-1">{p.name}</h4>
                  <p className="text-sm text-muted-foreground font-bold">₹{p.price?.toLocaleString()}</p>
                </Link>
              ))}
          </div>
        </section>
      </div>

      {/* Responsive Share Modal */}
      {isDesktop ? (
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6 glass-strong">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-center text-foreground">Share this Material</DialogTitle>
              <DialogDescription className="text-center font-medium text-muted-foreground">
                Choose a platform to share {product.brand} {product.name}
              </DialogDescription>
            </DialogHeader>
            <ShareContent />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DrawerContent className="rounded-t-[32px] p-6 pb-10 glass-strong">
            <DrawerHeader className="px-0 pb-6">
              <DrawerTitle className="text-2xl font-black text-center text-foreground">Share Material</DrawerTitle>
              <DrawerDescription className="text-center font-medium text-muted-foreground">
                Spread the word about {product.name}
              </DrawerDescription>
            </DrawerHeader>
            <ShareContent />
          </DrawerContent>
        </Drawer>
      )}
    </Layout>
  );
};

export default RawMaterialDetail;
