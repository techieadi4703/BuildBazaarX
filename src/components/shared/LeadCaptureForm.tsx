import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface LeadCaptureFormProps {
  variant?: "default" | "compact" | "hero";
  title?: string;
  subtitle?: string;
}

export const LeadCaptureForm = ({ 
  variant = "default",
  title = "Plan Your Dream Home Today",
  subtitle = "Get a free consultation and cost estimate from our experts."
}: LeadCaptureFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    budget: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Thank you for your interest!",
      description: "Our team will contact you within 24 hours.",
    });
    
    setFormData({ name: "", phone: "", city: "", budget: "" });
    setIsSubmitting(false);
  };

  const isCompact = variant === "compact";
  const isHero = variant === "hero";

  return (
    <section className={`${isHero ? "py-16 md:py-24 bg-primary" : isCompact ? "py-12 bg-secondary" : "py-16 md:py-24 bg-secondary"}`}>
      <div className="container mx-auto px-4">
        <div className={`${isHero ? "max-w-4xl" : "max-w-2xl"} mx-auto`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isHero ? "text-primary-foreground" : "text-foreground"}`}>
              {title}
            </h2>
            <p className={isHero ? "text-primary-foreground/80" : "text-muted-foreground"}>
              {subtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={`${isHero ? "bg-card p-6 md:p-8 rounded-2xl shadow-2xl" : "bg-card p-6 md:p-8 rounded-2xl shadow-lg"}`}>
            <div className={`grid ${isCompact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"} gap-4 mb-6`}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-lg"
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
                  className="rounded-lg"
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
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                >
                  <SelectTrigger id="budget" className="rounded-lg">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-2l">Under ₹2 Lakh</SelectItem>
                    <SelectItem value="2-5l">₹2 - 5 Lakh</SelectItem>
                    <SelectItem value="5-10l">₹5 - 10 Lakh</SelectItem>
                    <SelectItem value="10-20l">₹10 - 20 Lakh</SelectItem>
                    <SelectItem value="above-20l">Above ₹20 Lakh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="w-full sm:w-auto rounded-full px-8 shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Get Free Consultation"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
