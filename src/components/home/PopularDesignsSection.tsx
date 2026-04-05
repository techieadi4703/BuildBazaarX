import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import kitchenImage from "@/assets/kitchen-design.jpg";
import bedroomImage from "@/assets/bedroom-design.jpg";
import livingroomImage from "@/assets/livingroom-design.jpg";
import wardrobeImage from "@/assets/wardrobe-design.jpg";
import fullhomeImage from "@/assets/fullhome-design.jpg";

const designCategories = [
  {
    id: 1,
    title: "Modular Kitchen",
    image: kitchenImage,
    designs: "120+ Designs",
    startingPrice: "₹1.5L",
  },
  {
    id: 2,
    title: "Bedroom",
    image: bedroomImage,
    designs: "85+ Designs",
    startingPrice: "₹80K",
  },
  {
    id: 3,
    title: "Living Room",
    image: livingroomImage,
    designs: "95+ Designs",
    startingPrice: "₹70K",
  },
  {
    id: 4,
    title: "Wardrobe",
    image: wardrobeImage,
    designs: "60+ Designs",
    startingPrice: "₹45K",
  },
  {
    id: 5,
    title: "Full Home Interior",
    image: fullhomeImage,
    designs: "150+ Packages",
    startingPrice: "₹5L",
  },
];

export const PopularDesignsSection = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Design Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {designCategories.map((category) => (
            <Link key={category.id} to="/designs">
              <Card className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl rounded-2xl">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-muted-foreground">{category.designs}</span>
                    <span className="text-accent font-medium">From {category.startingPrice}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Button asChild size="lg" className="rounded-full px-8 shadow-lg">
            <Link to="/designs">
              View All Designs
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
