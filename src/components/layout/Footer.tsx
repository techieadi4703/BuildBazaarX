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

const operationalSectors = [
  { name: "Home Interior", path: "/designs?category=full-home" },
  { name: "Construction", path: "/materials?category=construction" },
  { name: "Renovation", path: "/designs?category=living-room" },
  { name: "On-site Execution", path: "/professional/auth" },
  { name: "Material Supply", path: "/materials" },
];

const trustBadges = [
  { name: "Verified Workers", description: "Vetted Professionals" },
  { name: "Trusted Suppliers", description: "Certified Logistics" },
  { name: "Quality Materials", description: "Structural Grade" },
  { name: "Transparent Pricing", description: "Market Rates" },
];

export const Footer = () => {
  return (
    <footer className="bg-[#0e0e0d] text-[#f6f3f0] border-t border-white/5 font-body overflow-hidden">
      <div className="container mx-auto px-4 pt-10 pb-24 md:pt-12 md:pb-4 max-w-7xl">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-y-10 gap-x-4 lg:gap-6 mb-8"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Company Info - 3 columns */}
          <motion.div className="col-span-2 md:col-span-4 lg:col-span-3 space-y-1" variants={columnVariants}>
            <Link to="/" className="inline-block group">
              <motion.img 
                src={logo} 
                alt="BuildBazaarX" 
                className="h-20 md:h-40 pl-40 md:pl-10 w-auto brightness-110" 
                whileHover={{ scale: 1.02 }}
              />
            </Link>
            <p className="text-[13px] text-[#74777d] leading-relaxed font-medium pr-8">
              A curated logistics layer and structural monograph network for avant-garde architectural execution. We bridge the gap between visionary design and ground-level implementation.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Instagram, href: "https://www.instagram.com/buildbazaarxindia/" },
                { Icon: Linkedin, href: "https://www.linkedin.com/company/buildbazaarx-india" }
              ].map((social, i) => (
                <motion.a 
                  key={i} 
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-[#0e0e0d] transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <social.Icon className="w-3.5 h-3.5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links - 2 columns */}
          <motion.div className="col-span-1 lg:col-span-2 lg:pl-4" variants={columnVariants}>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#735c00] mb-5">Discovery</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <motion.li key={link.path} variants={itemVariants}>
                  <Link
                    to={link.path}
                    className="text-[13px] text-[#74777d] hover:text-white transition-colors duration-200 inline-block font-medium"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Operational Sectors - 2 columns */}
          <motion.div className="col-span-1 lg:col-span-2 lg:pl-4" variants={columnVariants}>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#735c00] mb-5">Sectors</h3>
            <ul className="space-y-3">
              {operationalSectors.map((sector) => (
                <motion.li key={sector.name} variants={itemVariants}>
                  <Link 
                    to={sector.path} 
                    className="text-[13px] text-[#74777d] hover:text-white transition-colors duration-200 inline-block font-medium"
                  >
                    {sector.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Trust Matrix - 5 columns (2x2 Block) */}
          <motion.div className="col-span-2 md:col-span-2 lg:col-span-5 lg:pl-8" variants={columnVariants}>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#735c00] mb-5 text-center lg:text-left">Trust Node</h3>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {trustBadges.map(badge => (
                <motion.div 
                  key={badge.name} 
                  className="bg-white/5 border border-white/5 p-5 md:p-6 rounded-2xl hover:bg-[#735c00]/10 transition-all duration-300 group cursor-default"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <CheckCircle className="w-5 h-5 text-[#735c00] mb-3" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-white leading-tight mb-2">{badge.name}</p>
                  <p className="text-[10px] text-[#74777d] font-medium leading-relaxed">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 py-6 border-t border-white/5 text-[11px] font-black uppercase tracking-[0.25em]">
          <div className="flex flex-wrap gap-6 md:gap-12 justify-center">
            <Link to="/terms" className="text-[#44474c] hover:text-white transition-all hover:tracking-[0.3em] duration-500">Terms</Link>
            <Link to="/privacy" className="text-[#44474c] hover:text-white transition-all hover:tracking-[0.3em] duration-500">Privacy</Link>
            <Link to="/refunds" className="text-[#44474c] hover:text-white transition-all hover:tracking-[0.3em] duration-500">Refunds</Link>
          </div>
          <div className="flex flex-col items-center lg:items-end gap-2">
            <p className="text-[#44474c] text-center lg:text-right">
              © 2026 BuildBazaarX Network. <span className="text-[#735c00]/50">Curated Architecture.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
