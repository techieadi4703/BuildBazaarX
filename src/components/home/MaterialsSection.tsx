import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Truck, IndianRupee, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import plywoodImage from "@/assets/products/plywood.jpg";
import paintImage from "@/assets/products/paint.jpg";
import tilesImage from "@/assets/products/tiles.jpg";
import ledImage from "@/assets/products/led-light.jpg";
import cementImage from "@/assets/products/cement.jpg";
import laminateImage from "@/assets/products/laminate.jpg";

const featuredProducts = [
  {
    id: 1,
    name: "Greenply Plywood BWR Grade",
    image: plywoodImage,
    brand: "Greenply",
    price: 85,
    unit: "per sq ft",
    originalPrice: 110,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Asian Paints Royale Matt",
    image: paintImage,
    brand: "Asian Paints",
    price: 450,
    unit: "per litre",
    originalPrice: 520,
    rating: 4.7,
  },
  {
    id: 3,
    name: "Kajaria Floor Tiles",
    image: tilesImage,
    brand: "Kajaria",
    price: 65,
    unit: "per sq ft",
    originalPrice: 85,
    rating: 4.6,
  },
  {
    id: 4,
    name: "Philips LED Panel Light",
    image: ledImage,
    brand: "Philips",
    price: 850,
    unit: "per piece",
    originalPrice: 1100,
    rating: 4.8,
  },
  {
    id: 5,
    name: "UltraTech Cement PPC",
    image: cementImage,
    brand: "UltraTech",
    price: 380,
    unit: "per bag",
    originalPrice: 420,
    rating: 4.4,
  },
  {
    id: 6,
    name: "Merino Laminates",
    image: laminateImage,
    brand: "Merino",
    price: 1200,
    unit: "per sheet",
    originalPrice: 1450,
    rating: 4.5,
  },
];

const usps = [
  { icon: IndianRupee, title: "Best Price", description: "Competitive market rates" },
  { icon: BadgeCheck, title: "Verified Suppliers", description: "Trusted material partners" },
  { icon: Truck, title: "Home Delivery", description: "Doorstep delivery available" },
];

export const MaterialsSection = () => {
  return (
    <section className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {featuredProducts.map((product) => {
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            return (
              <Link key={product.id} to="/materials">
                <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                      {discount}% OFF
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-primary font-medium mb-1">{product.brand}</p>
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span className="text-xs text-muted-foreground">{product.rating}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-foreground">₹{product.price}</span>
                      <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{product.unit}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* USPs */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {usps.map((usp, index) => (
            <Card key={index} className="border-border hover:border-primary/50 transition-colors rounded-xl shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                  <usp.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{usp.title}</h3>
                  <p className="text-muted-foreground text-sm">{usp.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="rounded-full px-8 shadow-lg">
            <Link to="/materials">
              Browse All Materials
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};