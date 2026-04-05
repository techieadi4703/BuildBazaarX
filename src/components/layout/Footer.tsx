import React from "react";
import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube,
  CheckCircle 
} from "lucide-react";
import logo from "@/assets/logo.png";

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "Designs Catalog", path: "/designs" },
  { name: "Raw Materials", path: "/materials" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const services = [
  "Home Interior",
  "Construction",
  "Renovation",
  "On-site Execution",
  "Material Supply",
];

const trustBadges = [
  "Verified Workers",
  "Trusted Suppliers",
  "Quality Materials",
  "Transparent Pricing",
];

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="BuildBazaarX" className="h-12 w-auto bg-background rounded-lg p-1" />
            </Link>
            <p className="text-background/70 text-sm">
              One platform for home designs, skilled workers, and quality raw materials.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-background/70 hover:text-accent transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-accent transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-accent transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-accent transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-background">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-background">Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service} className="text-background/70 text-sm">
                  {service}
                </li>
              ))}
              <li>
                <Link to="/professional/auth" className="text-background/70 hover:text-accent transition-colors text-sm">
                  Join as Professional
                </Link>
              </li>
              <li>
                <Link to="/designer/auth" className="text-background/70 hover:text-accent transition-colors text-sm">
                  Join as Designer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-background">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-background/70 text-sm">
                  Jaipur, Rajasthan, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <a href="tel:+919521259456" className="text-background/70 hover:text-accent transition-colors text-sm">
                  +91 9521259456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a href="mailto:contact@buildbazaarx.com" className="text-background/70 hover:text-accent transition-colors text-sm">
                  contact@buildbazaarx.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-background/20 mt-10 pt-8">
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {trustBadges.map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-background/70">{badge}</span>
              </div>
            ))}
          </div>

          {/* Legal Links & Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/60">
            <div className="flex gap-6">
              <Link to="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-accent transition-colors">Terms & Conditions</Link>
              <Link to="#" className="hover:text-accent transition-colors">Refund Policy</Link>
            </div>
            <p>© 2026 BuildBazaarX. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
