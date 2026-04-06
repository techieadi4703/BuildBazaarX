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
import { motion } from "framer-motion";

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

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
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Company Info */}
          <motion.div className="space-y-4" variants={columnVariants}>
            <Link to="/" className="flex items-center gap-2 group">
              <motion.img 
                src={logo} 
                alt="BuildBazaarX" 
                className="h-12 w-auto bg-background rounded-lg p-1" 
                whileHover={{ scale: 1.05 }}
              />
            </Link>
            <p className="text-background/70 text-sm">
              One platform for home designs, skilled workers, and quality raw materials.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Youtube, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  className="text-background/70 hover:text-accent"
                  aria-label={label}
                  whileHover={{ scale: 1.25, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={columnVariants}>
            <h3 className="font-semibold text-lg mb-4 text-background">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <motion.li key={link.path} variants={itemVariants}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-accent hover:translate-x-1 transition-all duration-200 text-sm inline-block"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={columnVariants}>
            <h3 className="font-semibold text-lg mb-4 text-background">Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <motion.li key={service} className="text-background/70 text-sm" variants={itemVariants}>
                  {service}
                </motion.li>
              ))}
              <motion.li variants={itemVariants}>
                <Link to="/professional/auth" className="text-background/70 hover:text-accent hover:translate-x-1 transition-all duration-200 text-sm inline-block">
                  Join as Professional
                </Link>
              </motion.li>
              <motion.li variants={itemVariants}>
                <Link to="/designer/auth" className="text-background/70 hover:text-accent hover:translate-x-1 transition-all duration-200 text-sm inline-block">
                  Join as Designer
                </Link>
              </motion.li>
              <motion.li variants={itemVariants}>
                <Link to="/supplier/auth" className="text-background/70 hover:text-accent hover:translate-x-1 transition-all duration-200 text-sm inline-block">
                  Join as Supplier
                </Link>
              </motion.li>
            </ul>
          </motion.div>

          {/* Contact Details */}
          <motion.div variants={columnVariants}>
            <h3 className="font-semibold text-lg mb-4 text-background">Contact</h3>
            <ul className="space-y-3">
              <motion.li className="flex items-start gap-3 group" variants={itemVariants}>
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5 group-hover:animate-bounce-subtle" />
                <span className="text-background/70 text-sm">
                  Jaipur, Rajasthan, India
                </span>
              </motion.li>
              <motion.li className="flex items-center gap-3 group" variants={itemVariants}>
                <Phone className="w-5 h-5 text-accent shrink-0 group-hover:animate-bounce-subtle" />
                <a href="tel:+919521259456" className="text-background/70 hover:text-accent transition-colors text-sm">
                  +91 9521259456
                </a>
              </motion.li>
              <motion.li className="flex items-center gap-3 group" variants={itemVariants}>
                <Mail className="w-5 h-5 text-accent shrink-0 group-hover:animate-bounce-subtle" />
                <a href="mailto:contact@buildbazaarx.com" className="text-background/70 hover:text-accent transition-colors text-sm">
                  contact@buildbazaarx.com
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Trust Badges */}
        <div className="border-t border-background/20 mt-10 pt-8">
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {trustBadges.map((badge) => (
              <motion.div 
                key={badge} 
                className="flex items-center gap-2 text-sm group"
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
              >
                <CheckCircle className="w-4 h-4 text-accent group-hover:scale-110 transition-transform duration-200" />
                <span className="text-background/70 group-hover:text-background transition-colors duration-200">{badge}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Legal Links & Copyright */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/60"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex gap-6">
              <Link to="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-accent transition-colors">Terms & Conditions</Link>
              <Link to="#" className="hover:text-accent transition-colors">Refund Policy</Link>
            </div>
            <p>© 2026 BuildBazaarX. All Rights Reserved.</p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
