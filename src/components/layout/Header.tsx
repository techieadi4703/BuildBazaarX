import React, { useMemo, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, User, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CartSheet } from "@/components/cart/CartSheet";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { logoIcon } from "@/lib/cdnImages";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Designs Catalog", path: "/designs" },
  { name: "Raw Materials", path: "/materials" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "New Project", path: "/new-project" },
];

export const Header = () => {
  const { user, userRole } = useAuth();
  const { totalItems: wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const onScroll = () => header.setAttribute("data-scrolled", String(window.scrollY > 20));
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Derive dashboard path from cached role in AuthContext
  const userDashboardPath = "/";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isNonUserRoute = false;

  return (
    <motion.header 
      ref={headerRef}
      className="sticky top-0 z-50 bg-[var(--bg-base)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] transition-[border-color,box-shadow] duration-200 data-[scrolled=true]:border-[var(--accent-warm)] data-[scrolled=true]:shadow-[var(--shadow-sm)]"
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
            <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <Link
                    to={link.path}
                    className={`text-sm font-medium transition-colors hover:text-primary relative py-2 nav-link-underline whitespace-nowrap ${
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
          <div className="hidden lg:flex items-center gap-3 xl:gap-6 shrink-0">
            {!isNonUserRoute && user && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <CartSheet />
              </motion.div>
            )}
            {user ? (
              <motion.div 
                className="flex items-center gap-3 xl:gap-6 shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                {!isNonUserRoute && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors group outline-none">
                        <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="max-w-[120px] truncate font-medium">
                          {user.user_metadata?.full_name || user.email?.split("@")[0]}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={8} className="w-48">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer w-full flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/wishlist" className="cursor-pointer w-full flex items-center justify-between">
                          <div className="flex items-center">
                            <Heart className="mr-2 h-4 w-4" />
                            <span>Wishlist</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="bg-[#855300] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders" className="cursor-pointer w-full flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Orders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <div className="pl-4 border-l border-[var(--border-subtle)] h-6 flex items-center">
                  <ThemeToggle />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center gap-4"
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
                <Button asChild size="sm" className="rounded-full px-6 hover:scale-105 hover:shadow-[var(--shadow-md)] transition-all duration-200">
                  <Link to="/auth">
                    Sign Up
                  </Link>
                </Button>
                <div className="pl-4 border-l border-[var(--border-subtle)] h-6 flex items-center">
                  <ThemeToggle />
                </div>
              </motion.div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            {!isNonUserRoute && user && (
              <>
                <Link to="/wishlist" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <div className="relative">
                    <Heart className="w-5 h-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#855300] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-2">
                  <CartSheet />
                </div>
              </>
            )}
            <div className="pl-2 border-l border-[var(--border-subtle)] h-6 flex items-center ml-1">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile menu removed */}
      </div>
    </motion.header>
  );
};
