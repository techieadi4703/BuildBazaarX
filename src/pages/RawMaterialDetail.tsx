
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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

  useEffect(() => {
    // Simulate fetching data
    const foundProduct = allProducts.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    }
    setIsLoading(false);
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

      <div className="container mx-auto px-4 py-8 md:py-12">
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
              <div className="bg-gray-50 rounded-3xl p-6 md:p-8 space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p>Express Delivery</p>
                      <p className="text-[10px] uppercase text-gray-400 tracking-tighter">In 2-4 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
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

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {isInCart ? (
                    <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-1 shadow-sm w-full sm:w-auto">
                      <button 
                        onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-black text-lg">{cartItem.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}

                  <Button 
                    onClick={handleCartAction}
                    size="lg" 
                    className={`w-full h-16 rounded-2xl text-lg font-black transition-all shadow-lg ${
                      isInCart ? "bg-green-600 hover:bg-green-700" : "bg-gray-900 hover:bg-gray-800"
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
        <section className="mt-24 space-y-8">
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
                    />
                  </div>
                  <h4 className="font-bold text-gray-900 line-clamp-1">{p.name}</h4>
                  <p className="text-sm text-gray-500 font-bold">₹{p.price?.toLocaleString()}</p>
                </Link>
              ))}
          </div>
        </section>
      </div>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center">Share this Material</DialogTitle>
            <DialogDescription className="text-center font-medium">
              Choose a platform to share {product.brand} {product.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-6">
            <button 
              onClick={() => shareToPlatform("whatsapp")}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm">
                <MessageCircle className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">WhatsApp</span>
            </button>
            <button 
              onClick={() => shareToPlatform("facebook")}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <Facebook className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Facebook</span>
            </button>
            <button 
              onClick={() => shareToPlatform("twitter")}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-900 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm">
                <Twitter className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Twitter</span>
            </button>
            <button 
              onClick={() => shareToPlatform("linkedin")}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:bg-blue-800 group-hover:text-white transition-all shadow-sm">
                <Linkedin className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">LinkedIn</span>
            </button>
            <button 
              onClick={() => shareToPlatform("native")}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <MoreHorizontal className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">More</span>
            </button>
            <button 
              onClick={() => shareToPlatform("copy")}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-gray-600 group-hover:text-white transition-all shadow-sm">
                <Copy className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Copy Link</span>
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 truncate mr-4">{window.location.href}</span>
            <Button variant="ghost" size="sm" className="font-black text-primary uppercase text-[10px] tracking-widest" onClick={() => shareToPlatform("copy")}>
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default RawMaterialDetail;
