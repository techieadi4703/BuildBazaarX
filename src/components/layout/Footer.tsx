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
import { motion } from "framer-motion";
import { logo } from "@/lib/cdnImages";

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
    <footer className="bg-[#1c1c1a] text-[#f6f3f0] border-t border-white/5 font-body">
      <div className="container mx-auto px-4 py-5">
        {/* Logo — centered above the columns */}
        <motion.div
          className="flex flex-col items-center mb-5"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link to="/" className="flex items-center gap-2 group mb-2">
            <motion.img
              src={logo}
              alt="BuildBazaarX"
              className="h-10 w-auto"
              whileHover={{ scale: 1.05 }}
            />
          </Link>
          <p className="text-[12px] text-[#74777d] leading-relaxed font-medium text-center max-w-xs">
            A curated logistics layer and structural monograph network for avant-garde architectural execution.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-4 lg:gap-12 mb-5"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Quick Links */}
          <motion.div variants={columnVariants}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#735c00] mb-2">Discovery</h3>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <motion.li key={link.path} variants={itemVariants}>
                  <Link
                    to={link.path}
                    className="text-[12px] text-[#74777d] hover:text-white transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Operational Sectors */}
          <motion.div variants={columnVariants}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#735c00] mb-2">Services</h3>
            <ul className="space-y-1">
              {operationalSectors.map((sector) => (
                <motion.li key={sector.name} variants={itemVariants}>
                  <Link
                    to={sector.path}
                    className="text-[12px] text-[#74777d] hover:text-white transition-colors duration-200 font-medium"
                  >
                    {sector.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Connect & Partner */}
          <motion.div variants={columnVariants}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#735c00] mb-2">Contact</h3>
            <div className="space-y-2">
              <ul className="space-y-1.5">
                <motion.li className="flex items-center gap-2" variants={itemVariants}>
                  <Mail className="w-3 h-3 text-[#735c00] shrink-0" />
                  <a href="mailto:techie.adi47@gmail.com" className="text-[11px] text-[#74777d] hover:text-white transition-colors font-medium break-all">
                    techie.adi47@gmail.com
                  </a>
                </motion.li>
                <motion.li className="flex items-center gap-2" variants={itemVariants}>
                  <Phone className="w-3 h-3 text-[#735c00] shrink-0" />
                  <a href="tel:+919521259456" className="text-[11px] text-[#74777d] hover:text-white transition-colors font-medium">
                    +91 9521259456
                  </a>
                </motion.li>
                <motion.li className="flex items-center gap-2" variants={itemVariants}>
                  <Phone className="w-3 h-3 text-[#735c00] shrink-0" />
                  <a href="tel:+917309958494" className="text-[11px] text-[#74777d] hover:text-white transition-colors font-medium">
                    +91 7309958494
                  </a>
                </motion.li>
              </ul>

              <div className="flex flex-col gap-1.5">
                <a href="https://professional.buildbazaarx.com/" className="text-[9px] uppercase font-black tracking-widest text-white/40 hover:text-[#735c00] transition-colors">
                  Join: Professional
                </a>
                <a href="https://designer.buildbazaarx.com/" className="text-[9px] uppercase font-black tracking-widest text-white/40 hover:text-[#735c00] transition-colors">
                  Join: Designer
                </a>
                <a href="https://seller.buildbazaarx.com/" className="text-[9px] uppercase font-black tracking-widest text-white/40 hover:text-[#735c00] transition-colors">
                  Join: Supplier
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar: Trust Badges (Modern Horizontal Strip) */}
        <div className="border-t border-white/5 pt-3">
          <div className="flex flex-wrap justify-between gap-2 mb-3 pb-3 border-b border-white/5">
            {trustBadges.map(badge => (
              <div key={badge.name} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-[#735c00] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-tight text-white/30">{badge.name}</span>
                  <span className="text-[9px] text-[#74777d] italic">{badge.description}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#44474c]">
            <div className="flex gap-8">
              <Link to="/privacy-policy" className="hover:text-[#735c00] transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-[#735c00] transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-[#735c00] transition-colors">Support</Link>
            </div>
            <p className="opacity-40">© 2026 BuildBazaarX Network. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
