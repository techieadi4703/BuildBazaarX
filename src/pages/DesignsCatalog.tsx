import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
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

  const filteredDesigns = designs.filter((design) => {
    const matchesCategory = selectedCategory === "all" || design.category === selectedCategory;
    const matchesStyle = selectedStyle === "all" || design.style === selectedStyle;
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStyle && matchesSearch;
  });

  const trendingDesigns = designs.filter((d) => d.trending);

  return (
    <Layout>
      {/* Filters & Search */}
      <section className="py-6 bg-card border-b border-border sticky top-16 md:top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <Button
              variant="outline"
              className="md:hidden w-full"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  {styles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(selectedCategory !== "all" || selectedStyle !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedStyle("all");
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  {styles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </section>

      {/* Trending Designs */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">🔥 Trending Designs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingDesigns.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        </div>
      </section>

      {/* All Designs */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">All Designs</h2>
            <span className="text-muted-foreground">{filteredDesigns.length} designs found</span>
          </div>
          
          {filteredDesigns.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDesigns.map((design) => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No designs found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedStyle("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Lead Capture */}
      <LeadCaptureForm
        variant="compact"
        title="Love a design? Get a FREE Consultation"
        subtitle="Our design experts will help you customize and plan your project."
      />
    </Layout>
  );
};

interface DesignCardProps {
  design: typeof designs[0];
}

const DesignCard = ({ design }: DesignCardProps) => {
  return (
    <Link to={`/designs/${design.id}`}>
      <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={design.image}
            alt={design.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary">{design.style}</Badge>
            {design.trending && (
              <Badge className="bg-destructive text-destructive-foreground">Trending</Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
              {design.name}
            </h3>
            <p className="text-sm text-muted-foreground">{design.size}</p>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Execution Cost:</span>
              <span className="text-foreground">{design.executionCost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Materials:</span>
              <span className="text-foreground">{design.materialsCost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customize:</span>
              <span className="text-foreground">{design.customizeCost}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-semibold">
              <span className="text-foreground">Total Cost:</span>
              <span className="text-primary">{design.totalCost}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" size="sm">
              View Details
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Customize
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default DesignsCatalog;
