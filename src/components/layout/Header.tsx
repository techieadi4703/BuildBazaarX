import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, User, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CartSheet } from "@/components/cart/CartSheet";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { logoIcon } from "@/lib/cdnImages";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Designs Catalog", path: "/designs" },
  { name: "Raw Materials", path: "/materials" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export const Header = () => {
  const { user, userRole } = useAuth();
  const { totalItems: wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  // Derive dashboard path from cached role in AuthContext
  const userDashboardPath = "/";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isNonUserRoute = false;

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-primary/5 shadow-sm transition-all duration-300"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12 md:h-14">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to={userDashboardPath} className="flex items-center gap-3 group">
              <motion.img
                src={logoIcon}
                alt="BuildBazaarX Logo"
                className="h-9 md:h-10 w-auto object-contain rounded-lg shadow-sm"
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
              <span className="text-xl md:text-2xl font-bold tracking-tight text-primary leading-none group-hover:tracking-wide transition-all duration-300">
                Build<span className="text-[#E8A317]">Bazaar</span>X
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          {!isNonUserRoute && (
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <Link
                    to={link.path}
                    className={`text-sm font-medium transition-colors hover:text-primary relative py-2 nav-link-underline ${
                      location.pathname === link.path
                        ? "text-primary active"
                        : "text-foreground"
                    }`}
                  >
                    {link.name}
                    {location.pathname === link.path && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>
          )}

          {/* Cart + Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {!isNonUserRoute && user && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <CartSheet />
              </motion.div>
            )}
            {user ? (
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                {!isNonUserRoute && (
                  <>
                    <Link 
                      to="/wishlist" 
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group mr-2"
                    >
                      <div className="relative">
                        <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                            {wishlistCount}
                          </span>
                        )}
                      </div>
                      <span className="hidden lg:inline font-medium">Wishlist</span>
                    </Link>
                    <Link 
                      to="/orders" 
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="hidden lg:inline font-medium">Orders</span>
                    </Link>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group ml-2 border-l pl-4"
                    >
                      <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="max-w-[120px] truncate font-medium">
                        {user.user_metadata?.full_name || user.email?.split("@")[0]}
                      </span>
                    </Link>
                  </>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full hover:scale-105 transition-transform duration-200" 
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button asChild variant="ghost" size="sm" className="rounded-full hover:scale-105 transition-transform duration-200">
                  <Link to="/auth?mode=login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm" className="rounded-full px-6 hover:scale-105 hover:shadow-lg transition-all duration-200">
                  <Link to="/auth">
                    Sign Up
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-1">
            {!isNonUserRoute && user && (
              <>
                <Link to="/wishlist" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <div className="p-2">
                  <CartSheet />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu removed */}
      </div>
    </motion.header>
  );
};
