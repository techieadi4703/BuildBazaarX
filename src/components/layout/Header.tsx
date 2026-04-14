import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut, User, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import logoIcon from "@/assets/logo-icon.png";
import { CartSheet } from "@/components/cart/CartSheet";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Designs Catalog", path: "/designs" },
  { name: "Raw Materials", path: "/materials" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userDashboardPath, setUserDashboardPath] = useState<string>("/");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async (userId: string) => {
      const { data: designer } = await supabase.from('designers').select('id').eq('id', userId).maybeSingle();
      if (designer) { setUserDashboardPath('/designer/dashboard'); return; }
      
      const { data: professional } = await supabase.from('professionals').select('id').eq('id', userId).maybeSingle();
      if (professional) { setUserDashboardPath('/professional/dashboard'); return; }
      
      const { data: supplier } = await supabase.from('suppliers').select('id').eq('id', userId).maybeSingle();
      if (supplier) { setUserDashboardPath('/supplier/dashboard'); return; }

      setUserDashboardPath('/');
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        window.setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        setUserDashboardPath('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const isProfessionalRoute = location.pathname.startsWith("/professional");
  const isDesignerRoute = location.pathname.startsWith("/designer");
  const isSupplierRoute = location.pathname.startsWith("/supplier");
  const isNonUserRoute = isProfessionalRoute || isDesignerRoute || isSupplierRoute;

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
            <nav className="hidden md:flex items-center gap-8">
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
          <div className="hidden md:flex items-center gap-3">
            {!isNonUserRoute && (
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
                      to="/orders" 
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <Package className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden lg:inline font-medium">Orders</span>
                    </Link>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group ml-2 border-l pl-4"
                    >
                      <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
                  <Link to="/auth/select-role?mode=login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm" className="rounded-full px-6 hover:scale-105 hover:shadow-lg transition-all duration-200">
                  <Link to="/auth/select-role">
                    Sign Up
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Cart + Menu */}
          <div className="md:hidden flex items-center gap-1">
            {!isNonUserRoute && <CartSheet />}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden py-4 border-t border-border overflow-hidden"
            >
              <nav className="flex flex-col gap-2">
                {!isNonUserRoute && navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-sm font-medium transition-colors hover:text-primary py-2 px-3 rounded-md relative flex items-center justify-between group ${
                        location.pathname === link.path
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      <span className="relative z-10">{link.name}</span>
                      {location.pathname === link.path && (
                        <motion.div
                          layoutId="mobile-nav-pill"
                          className="absolute inset-0 bg-primary/5 rounded-md z-0"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <ArrowRight className={`w-4 h-4 transition-all ${location.pathname === link.path ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                    </Link>
                  </motion.div>
                ))}

                {user ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {!isNonUserRoute && (
                      <Link
                        to="/orders"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-sm font-medium transition-colors text-foreground hover:text-primary flex items-center gap-2 mb-4"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      className="mt-2 rounded-full w-full"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 space-y-2 border-t pt-4"
                  >
                    <div className="grid grid-cols-1 gap-2">
                      <Button asChild variant="outline" className="rounded-full text-foreground w-full">
                        <Link to="/auth/select-role?mode=login" onClick={() => setIsMenuOpen(false)}>
                          <LogIn className="w-4 h-4 mr-2" />
                          Login
                        </Link>
                      </Button>
                      <Button asChild className="rounded-full w-full">
                        <Link to="/auth/select-role" onClick={() => setIsMenuOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
