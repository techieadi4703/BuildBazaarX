import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut, User, Package, Heart, ShieldCheck, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CartSheet } from "@/components/cart/CartSheet";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { logoIcon } from "@/lib/cdnImages";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { name: "Designs Catalog", path: "/designs" },
  { name: "Raw Materials", path: "/materials" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export const Header = () => {
  const { user } = useAuth();
  const { totalItems: wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset scroll-based state when navigating to a non-home route
  useEffect(() => {
    setScrolled(window.scrollY > 40);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  const close = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          transparent
            ? "bg-transparent border-b border-transparent"
            : "bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]/60"
        }`}
      >
        <div className="container mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo only */}
            <Link to="/" className="flex items-center" aria-label="BuildBazaarX Home">
              <motion.img
                src={logoIcon}
                alt="BuildBazaarX"
                className="h-9 md:h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </Link>

            {/* Right side: theme toggle + cart (if logged in) + menu trigger */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:block">
                <ThemeToggle variant={transparent ? "transparent" : "solid"} />
              </div>
              {user && (
                <div className="hidden sm:block">
                  <CartSheet />
                </div>
              )}
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full border transition-colors duration-200 ${
                  transparent
                    ? "border-white/30 bg-white/10 text-white backdrop-blur-md hover:border-white/60 hover:bg-white/20"
                    : "border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-warm)] hover:text-[var(--accent-warm)]"
                }`}
              >
                <Menu className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline text-xs font-semibold uppercase tracking-[0.2em]">Menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-in panel */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={close}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.45 }}
              className="fixed top-0 right-0 z-[70] h-full w-full sm:w-[420px] bg-[var(--bg-base)] shadow-[0_0_80px_rgba(0,0,0,0.25)] flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 md:px-8 h-16 md:h-20 border-b border-[var(--border-subtle)]/60 shrink-0">
                <Link to="/" onClick={close} className="flex items-center">
                  <img src={logoIcon} alt="BuildBazaarX" className="h-8 w-auto object-contain" />
                </Link>
                <button
                  onClick={close}
                  aria-label="Close menu"
                  className="p-2 rounded-full border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-warm)] hover:text-[var(--accent-warm)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 flex flex-col">
                {/* Nav links */}
                <nav className="flex flex-col gap-1">
                  <Link
                    to="/"
                    onClick={close}
                    className={`group flex items-center justify-between py-3.5 border-b border-[var(--border-subtle)]/50 text-2xl md:text-3xl font-display font-medium tracking-tight transition-colors ${
                      location.pathname === "/" ? "text-[var(--accent-warm)]" : "text-[var(--text-primary)] hover:text-[var(--accent-warm)]"
                    }`}
                  >
                    Home
                    <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={close}
                      className={`group flex items-center justify-between py-3.5 border-b border-[var(--border-subtle)]/50 text-2xl md:text-3xl font-display font-medium tracking-tight transition-colors ${
                        location.pathname === link.path ? "text-[var(--accent-warm)]" : "text-[var(--text-primary)] hover:text-[var(--accent-warm)]"
                      }`}
                    >
                      {link.name}
                      <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>
                  ))}
                  {user && (
                    <>
                      <Link to="/orders" onClick={close} className="flex items-center gap-2 py-3.5 border-b border-[var(--border-subtle)]/50 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-warm)] transition-colors">
                        <Package className="w-4 h-4" /> Orders
                      </Link>
                      <Link to="/wishlist" onClick={close} className="flex items-center gap-2 py-3.5 border-b border-[var(--border-subtle)]/50 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-warm)] transition-colors">
                        <Heart className="w-4 h-4" /> Wishlist
                        {wishlistCount > 0 && (
                          <span className="bg-[#855300] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                      <Link to="/profile" onClick={close} className="flex items-center gap-2 py-3.5 border-b border-[var(--border-subtle)]/50 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-warm)] transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                    </>
                  )}
                </nav>

                {/* DPIIT recognition badge */}
                <div className="mt-8 inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent-warm)] bg-[var(--accent-warm-faint)] text-[var(--accent-warm)] text-[11px] font-semibold uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  DPIIT Recognized Startup
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Auth + theme */}
                <div className="mt-10 pt-6 border-t border-[var(--border-subtle)]/60 flex flex-col gap-3">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full border border-[var(--border-subtle)] text-sm font-semibold text-red-500 hover:border-red-400 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link
                        to="/auth?mode=login"
                        onClick={close}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full border border-[var(--border-subtle)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent-warm)] hover:text-[var(--accent-warm)] transition-colors"
                      >
                        <LogIn className="w-4 h-4" /> Sign In
                      </Link>
                      <Link
                        to="/auth"
                        onClick={close}
                        className="flex-1 inline-flex items-center justify-center py-3 rounded-full bg-[var(--accent-warm)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
