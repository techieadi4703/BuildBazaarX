import { useState } from "react";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    projectType: "",
    message: "",
  });

  const design = id ? designsData[id as keyof typeof designsData] : null;

  if (!design) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Design Not Found</h1>
          <p className="text-muted-foreground mb-6">The design you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/designs">Browse All Designs</Link>
          </Button>
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
      title: "Consultation Request Sent!",
      description: "Our team will reach out within 24 hours.",
    });
    setFormData({ name: "", phone: "", city: "", projectType: "", message: "" });
  };

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % design.images.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + design.images.length) % design.images.length);

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <Link
            to="/designs"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Designs
          </Link>
        </div>
      </div>

      {/* ── Two-column hero ── */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* ── LEFT: Image Gallery ── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-md">
              <img
                src={design.images[currentImageIndex]}
                alt={design.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {design.trending && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  🔥 Trending
                </Badge>
              )}
              {/* Arrows */}
              {design.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}
              {/* Dot indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {design.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentImageIndex ? "bg-primary w-4" : "bg-background/70"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {design.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-primary shadow-md"
                      : "border-transparent opacity-55 hover:opacity-90"
                  }`}
                >
                  <img
                    src={img}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Design Info + Cost Summary ── */}
          <div className="space-y-6">
            {/* Tags + Title + Rating */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{design.category}</Badge>
                <Badge variant="outline">{design.style}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                {design.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-medium text-foreground">{design.rating}</span>
                  &nbsp;({design.reviews} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  {design.size}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {design.description}
            </p>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-4 bg-secondary rounded-2xl">
                <Clock className="w-5 h-5 mb-2 text-primary" />
                <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                <p className="font-semibold text-foreground text-xs md:text-sm leading-tight">
                  {design.timeline}
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-secondary rounded-2xl">
                <Shield className="w-5 h-5 mb-2 text-primary" />
                <p className="text-xs text-muted-foreground mb-1">Warranty</p>
                <p className="font-semibold text-foreground text-xs md:text-sm">
                  {design.warranty}
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-secondary rounded-2xl">
                <Check className="w-5 h-5 mb-2 text-primary" />
                <p className="text-xs text-muted-foreground mb-1">Quality</p>
                <p className="font-semibold text-foreground text-xs md:text-sm">Premium</p>
              </div>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {design.features.map((feat) => (
                <div key={feat} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </span>
                  {feat}
                </div>
              ))}
            </div>

            {/* ── Cost Summary Card ── */}
            <Card className="border border-primary/20 shadow-md rounded-2xl overflow-hidden">
              <div className="bg-primary/5 px-5 py-3 border-b border-primary/10">
                <h3 className="font-bold text-foreground text-base">Cost Summary</h3>
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Execution Cost</span>
                  <span className="font-medium text-foreground">
                    ₹{design.executionCost.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Materials Cost</span>
                  <span className="font-medium text-foreground">
                    ₹{design.materialsCost.toLocaleString("en-IN")}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-foreground text-base">Total Cost</span>
                  <span className="font-bold text-primary text-xl">
                    ₹{design.totalCost.toLocaleString("en-IN")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* CTA Button */}
            <Button
              className="w-full rounded-full text-base py-6 shadow-md"
              onClick={() => {
                const el = document.getElementById("consultation-form");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Phone className="w-4 h-4 mr-2" />
              Get Free Consultation
            </Button>
          </div>
        </div>
      </div>

      {/* ── Execution Cost Breakdown (full width) ── */}
      <ExecutionCostBreakdown />

      {/* ── Raw Materials Required (full width) ── */}
      <DesignPricingCalculator />

      {/* ── Free Consultation Form ── */}
      <section id="consultation-form" className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Get Free Consultation
              </h2>
              <p className="text-muted-foreground text-sm">
                Share your requirements and our design experts will reach out within 24 hours.
              </p>
            </div>

            <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
              <div className="bg-primary px-6 py-4 flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary-foreground" />
                <span className="font-semibold text-primary-foreground">Tell Us About Your Project</span>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="consult-name" className="text-sm font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="consult-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="consult-phone" className="text-sm font-medium">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="consult-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="consult-city" className="text-sm font-medium">City</Label>
                    <Input
                      id="consult-city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Your city"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="consult-project" className="text-sm font-medium">Project Type</Label>
                    <select
                      id="consult-project"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select project type</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Bedroom">Bedroom</option>
                      <option value="Living Room">Living Room</option>
                      <option value="Full Home">Full Home</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="consult-message" className="text-sm font-medium">
                    Message / Requirement
                  </Label>
                  <Textarea
                    id="consult-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your vision, budget expectations, or any specific requirements..."
                    rows={4}
                    className="rounded-lg resize-none"
                  />
                </div>

                <Button
                  className="w-full rounded-full text-base py-6 shadow-sm"
                  onClick={handleSubmit}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Get Free Consultation
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to be contacted by our design team. No spam, ever.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DesignDetail;
