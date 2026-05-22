import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Material Fallback Images
import {
  genericPlywoodImg as plywoodImg,
  genericPaintImg as paintImg,
  genericTilesImg as tilesImg,
  ledLightImg,
  showerImg,
  genericCementImg as cementImg,
  genericLaminateImg as laminateImg,
} from "@/lib/rawMaterialsData";

// Design Fallback Images
import fullhomeImage from "@/assets/fullhome-design.jpg";

const categoryFallbackImages: Record<string, string> = {
  wood: plywoodImg,
  paints: paintImg,
  tiles: tilesImg,
  electrical: ledLightImg,
  plumbing: showerImg,
  construction: cementImg,
  hardware: laminateImg,
};

const getFallbackImage = (item: any) => {
  if (item.id.startsWith("mat-") && item.category) {
    return categoryFallbackImages[item.category.toLowerCase()] || plywoodImg;
  }
  return fullhomeImage;
};

const Wishlist = () => {
  const { items, removeFromWishlist, isAuthenticated } = useWishlist();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/auth/select-role?mode=login");
    return null;
  }

  return (
    <Layout>
      <Helmet>
        <title>Your Wishlist | BuildBazaarX</title>
      </Helmet>
      
      <div className="bg-[#fcf9f6] min-h-screen py-12 px-4 md:px-8 font-body">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-[#735c00] fill-current" />
            <h1 className="text-4xl font-headline font-bold text-[#1c1c1a]">Your Wishlist</h1>
          </div>
          
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#e5e2df] max-w-2xl mx-auto"
            >
              <Heart className="w-16 h-16 text-[#c4c6cc] mx-auto mb-6" />
              <h2 className="text-2xl font-headline font-bold mb-4">Your wishlist is empty</h2>
              <p className="text-[#74777d] mb-8">Save your favorite designs here to easily find them later when you're ready to start building your dream space.</p>
              <Button asChild className="bg-[#735c00] hover:bg-[#5a4800] rounded-full px-8 py-6 text-base">
                <Link to="/designs">
                  Browse Designs <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {items.map((design) => {
                const isMaterial = design.id.startsWith("mat-");
                const linkTo = isMaterial ? `/raw-materials` : `/designs/${design.id.replace('db-', '')}`;

                return (
                <motion.div 
                  key={design.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e5e2df] group relative flex flex-col"
                >
                  <Link to={linkTo} className="block relative aspect-[4/3] overflow-hidden bg-[#f6f3f0]">
                    <img 
                      src={design.image} 
                      alt={design.name} 
                      loading="lazy"
                      width={400}
                      height={300}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackImage(design);
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={linkTo} className="hover:text-[#735c00] transition-colors">
                        <h3 className="font-headline font-bold text-xl line-clamp-1">{design.name}</h3>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-[#f6f3f0] px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#74777d]">
                        {design.category.replace("-", " ")}
                      </span>
                      <span className="bg-[#f6f3f0] px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#74777d]">
                        {design.style}
                      </span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-[#e5e2df] flex justify-between items-center">
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link to={linkTo}>View Details</Link>
                      </Button>
                      <button 
                        onClick={(e) => { e.preventDefault(); removeFromWishlist(design.id); }}
                        className="text-[#74777d] hover:text-[#ba1a1a] transition-colors p-2 rounded-full hover:bg-[#ba1a1a]/10"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )})}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
