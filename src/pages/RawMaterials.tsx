import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Package, Truck, BadgeCheck, IndianRupee, ArrowRight, Star, ShoppingCart, Heart } from "lucide-react";
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
  {
    id: "wood",
    name: "Wood & Boards",
    icon: "🪵",
    items: ["Commercial Plywood", "Marine Plywood", "MDF / HDHMR", "Laminates"],
  },
  {
    id: "construction",
    name: "Construction Materials",
    icon: "🧱",
    items: ["Cement", "Bricks", "Sand", "Steel"],
  },
  {
    id: "paints",
    name: "Paints & Finishes",
    icon: "🎨",
    items: ["Wall Paints", "Wood Polish", "Putty", "Primer"],
  },
  {
    id: "plumbing",
    name: "Plumbing & Sanitary",
    icon: "🚿",
    items: ["Pipes & Fittings", "Bathroom Accessories", "Taps & Showers"],
  },
  {
    id: "electrical",
    name: "Electrical & Lighting",
    icon: "💡",
    items: ["Wires", "Switches", "LED Lights", "Fans"],
  },
  {
    id: "tiles",
    name: "Tiles & Flooring",
    icon: "🔲",
    items: ["Floor Tiles", "Wall Tiles", "Marble", "Granite"],
  },
  {
    id: "hardware",
    name: "Hardware & Accessories",
    icon: "🔩",
    items: ["Hinges", "Handles", "Locks", "Screws"],
  },
];

const brands = [
  { name: "Greenply", logo: "🌲" },
  { name: "Century Ply", logo: "🪵" },
  { name: "Asian Paints", logo: "🎨" },
  { name: "Kajaria Tiles", logo: "🔲" },
  { name: "Havells", logo: "⚡" },
  { name: "Jaquar", logo: "🚿" },
  { name: "UltraTech", logo: "🏗️" },
  { name: "Philips", logo: "💡" },
];

const usps = [
  { icon: IndianRupee, title: "Best Market Price" },
  { icon: BadgeCheck, title: "100% Genuine Products" },
  { icon: Package, title: "Trusted Sellers" },
  { icon: Truck, title: "Fast Delivery" },
];

// Type for a product row from Supabase
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

  // ── Fetch products from Supabase ──────────────────────────────────────────
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data as Product[];
    },
  });

  const filteredProducts = products.filter((product) => {
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

  // ── Submit lead to Supabase ───────────────────────────────────────────────
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
      <section className="py-6 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for plywood, tiles, paints..."
                className="pl-10 bg-card h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-12">
              Search Products
            </Button>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="py-4 bg-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {usps.map((usp, index) => (
              <div key={index} className="flex items-center gap-2">
                <usp.icon className="w-5 h-5 text-primary-foreground" />
                <span className="font-medium text-primary-foreground text-sm">{usp.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name
                  : "All Products"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${filteredProducts.length} products found`}
              </p>
            </div>
            <Select defaultValue="popular">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popularity</SelectItem>
                <SelectItem value="low-high">Price: Low to High</SelectItem>
                <SelectItem value="high-low">Price: High to Low</SelectItem>
                <SelectItem value="rating">Customer Rating</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-16">
              <p className="text-destructive font-medium mb-2">Failed to load products</p>
              <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
            </div>
          )}

          {/* Products */}
          {!isLoading && !isError && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <p className="text-muted-foreground">No products found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Bulk Order Section */}
      <section className="py-10 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            🏗️ Bulk Orders? Get Extra Discounts!
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            Special pricing for contractors, builders & large projects. Up to 30% off on bulk orders.
          </p>
          <Button size="lg" variant="secondary">
            Request Bulk Quote
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Lead Form */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Can't Find What You Need?
              </h2>
              <p className="text-muted-foreground">
                Tell us your requirements and we'll get back with the best price.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-background p-6 rounded-xl border border-border">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material">Material Type</Label>
                  <Select
                    value={formData.material}
                    onValueChange={(value) => setFormData({ ...formData, material: value })}
                  >
                    <SelectTrigger id="material">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Requirement Details</Label>
                <Textarea
                  id="quantity"
                  placeholder="E.g., 100 sheets of 19mm Greenply plywood for modular kitchen..."
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Get Best Price Quote"}
              </Button>
            </form>
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
    <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-accent/30">
        <img
          src={getProductImage(product)}
          alt={product.name ?? "Product"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Discount Badge */}
        {product.discount != null && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
            {product.discount}% OFF
          </Badge>
        )}
        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-card rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-primary-foreground transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Brand */}
        <p className="text-xs text-primary font-medium uppercase tracking-wide">{product.brand}</p>

        {/* Name */}
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Specs */}
        <p className="text-xs text-muted-foreground">{product.specs}</p>

        {/* Rating */}
        {product.rating != null && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-green-600 text-primary-foreground px-2 py-0.5 rounded text-xs font-medium">
              <Star className="w-3 h-3 fill-current" />
              {product.rating}
            </div>
            <span className="text-xs text-muted-foreground">({(product.reviews ?? 0).toLocaleString()} reviews)</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">
            ₹{(product.price ?? 0).toLocaleString()}
          </span>
          {product.original_price != null && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.original_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Delivery */}
        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
          <Truck className="w-3 h-3" />
          Free Delivery
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1"
            size="sm"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
          <Button variant="outline" size="sm" onClick={() => onBuyNow(product)}>
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RawMaterials;
