import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "Rajesh Sharma",
    location: "Jaipur",
    rating: 5,
    review: "BuildBazaarX made my home renovation incredibly smooth. The design options were amazing and the workers were professional. Highly recommend!",
    project: "3BHK Interior",
  },
  {
    id: 2,
    name: "Priya Gupta",
    location: "Jodhpur",
    rating: 5,
    review: "Got my modular kitchen done through BuildBazaarX. The quality of materials and workmanship exceeded my expectations. Great value for money!",
    project: "Modular Kitchen",
  },
  {
    id: 3,
    name: "Amit Verma",
    location: "Udaipur",
    rating: 5,
    review: "Transparent pricing and verified workers gave me peace of mind. The entire process from design to execution was seamless.",
    project: "Full Home Interior",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Customer Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground">
            Real stories from homeowners who trusted BuildBazaarX for their dream homes.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-border hover:border-primary/30 transition-colors rounded-2xl shadow-sm hover:shadow-lg">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-accent/30 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Review */}
                <p className="text-foreground mb-6">
                  "{testimonial.review}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.project} • {testimonial.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
