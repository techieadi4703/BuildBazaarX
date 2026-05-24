
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
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all shadow-sm border border-green-100">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">WhatsApp</span>
        </button>
        <button 
          onClick={() => shareToPlatform("facebook")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1877F2] flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all shadow-sm border border-blue-100">
            <Facebook className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Facebook</span>
        </button>
        <button 
          onClick={() => shareToPlatform("twitter")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-900 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm border border-gray-200">
            <Twitter className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Twitter</span>
        </button>
        <button 
          onClick={() => shareToPlatform("linkedin")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0A66C2] flex items-center justify-center group-hover:bg-[#0A66C2] group-hover:text-white transition-all shadow-sm border border-blue-100">
            <Linkedin className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">LinkedIn</span>
        </button>
        <button 
          onClick={() => shareToPlatform("native")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#735c00] flex items-center justify-center group-hover:bg-[#735c00] group-hover:text-white transition-all shadow-sm border border-amber-100">
            <MoreHorizontal className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">More</span>
        </button>
        <button 
          onClick={() => shareToPlatform("copy")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-50 text-[#1c1c1a] flex items-center justify-center group-hover:bg-[#1c1c1a] group-hover:text-white transition-all shadow-sm border border-gray-200">
            <Copy className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Copy Link</span>
        </button>
      </div>
      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 truncate mr-4 italic">{window.location.href}</span>
        <Button variant="ghost" size="sm" className="font-black text-[#735c00] uppercase text-[10px] tracking-widest h-8 hover:bg-amber-50" onClick={() => shareToPlatform("copy")}>
          Copy
        </Button>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-100 py-4 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <Link
            to="/materials"
            className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Raw Materials
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-5 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group">
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:text-primary hover:scale-110 active:scale-95 transition-all"
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
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
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
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {product.rating}
                    <span className="text-gray-400 font-medium ml-1">({product.reviews} reviews)</span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                  {product.name}
                </h1>
                
                <p className="text-gray-500 font-medium text-lg italic">
                  {product.specs}
                </p>
              </div>
            </Reveal>

            <Reveal width="100%" direction="up" delay={0.1}>
              <div className="bg-gray-50 rounded-3xl p-4 md:p-8 space-y-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black text-gray-900">₹{product.price?.toLocaleString()}</span>
                  {product.original_price && product.original_price > (product.price ?? 0) && (
                    <>
                      <span className="text-xl text-gray-400 line-through font-bold">₹{product.original_price.toLocaleString()}</span>
                      <span className="text-green-600 font-black text-sm uppercase tracking-wider bg-green-100 px-3 py-1 rounded-full">
                        {Math.round(((product.original_price - (product.price ?? 0)) / product.original_price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="flex items-center gap-2 md:gap-3 text-sm font-bold text-gray-600">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p>Express Delivery</p>
                      <p className="text-[10px] uppercase text-gray-400 tracking-tighter">In 2-4 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-sm font-bold text-gray-600">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <p>{product.return_policy || "7 Days Replacement"}</p>
                      <p className="text-[10px] uppercase text-gray-400 tracking-tighter">
                        {product.return_policy === "No Returns" ? "Final Sale" : "Hassle-free returns"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-200" />

                <div className="flex items-center gap-2 md:gap-4 w-full">
                  {isInCart ? (
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl md:rounded-2xl p-0.5 md:p-1 shadow-sm shrink-0">
                      <button 
                        onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                        className="w-8 h-10 md:h-[54px] md:w-12 flex items-center justify-center hover:bg-gray-50 rounded-lg md:rounded-xl transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <span className="w-6 md:w-8 text-center font-black text-sm md:text-lg">{cartItem.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        className="w-8 h-10 md:h-[54px] md:w-12 flex items-center justify-center hover:bg-gray-50 rounded-lg md:rounded-xl transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  ) : null}

                  <Button 
                    onClick={handleCartAction}
                    className={`flex-1 h-11 md:h-16 rounded-xl md:rounded-2xl text-[13px] sm:text-base md:text-lg px-2 sm:px-8 font-black transition-all shadow-lg overflow-hidden ${
                      isInCart ? "bg-green-600 hover:bg-green-700" : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0" />
                    <span className="truncate">{isInCart ? "Checkout Now" : "Add to Cart"}</span>
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
                      <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="text-sm font-bold text-gray-700">{detail}</span>
                      </div>
                    )) : (
                      <>
                        <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-sm font-bold text-gray-700">Verified Quality</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-sm font-bold text-gray-700">Manufacturer Warranty</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Reveal>

              <Reveal width="100%" direction="up" delay={0.3}>
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">About this Product</h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {product.description || `This high-quality ${product.name} from ${product.brand} is specifically chosen for its durability and performance in modern construction projects. Meeting all industry standards, it ensures a premium finish and long-lasting results for your build.`}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <section className="mt-10 md:mt-24 space-y-6 md:space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-2">Build Better</h2>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Similar Materials</h3>
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
                  <div className="bg-gray-50 rounded-2xl aspect-square mb-4 overflow-hidden border border-gray-100 p-6 flex items-center justify-center transition-all group-hover:shadow-md">
                    <img 
                      src={getProductImage(p)} 
                      alt={p.name ?? ""} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" 
                    loading="lazy" decoding="async" />
                  </div>
                  <h4 className="font-bold text-gray-900 line-clamp-1">{p.name}</h4>
                  <p className="text-sm text-gray-500 font-bold">₹{p.price?.toLocaleString()}</p>
                </Link>
              ))}
          </div>
        </section>
      </div>

      {/* Responsive Share Modal */}
      {isDesktop ? (
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-center">Share this Material</DialogTitle>
              <DialogDescription className="text-center font-medium">
                Choose a platform to share {product.brand} {product.name}
              </DialogDescription>
            </DialogHeader>
            <ShareContent />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DrawerContent className="rounded-t-[32px] p-6 pb-10">
            <DrawerHeader className="px-0 pb-6">
              <DrawerTitle className="text-2xl font-black text-center">Share Material</DrawerTitle>
              <DrawerDescription className="text-center font-medium">
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
