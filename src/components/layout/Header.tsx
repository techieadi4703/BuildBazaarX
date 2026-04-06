import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import logoIcon from "@/assets/logo-icon.png";
import { CartSheet } from "@/components/cart/CartSheet";

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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
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
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoIcon}
              alt="BuildBazaarX Logo"
              className="h-10 md:h-12 w-auto object-contain"
            />
            <span className="text-xl md:text-2xl font-bold tracking-tight text-primary leading-none">
              Build<span className="text-accent">Bazaar</span>X
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isNonUserRoute && (
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Cart + Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isNonUserRoute && <CartSheet />}
            {user ? (
              <>
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
                <Button variant="outline" size="sm" className="rounded-full" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/auth/select-role?mode=login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm" className="rounded-full px-6">
                  <Link to="/auth/select-role">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Cart + Menu */}
          <div className="md:hidden flex items-center gap-1">
            {!isNonUserRoute && <CartSheet />}
            <button
              className="p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {!isNonUserRoute && navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  {!isNonUserRoute && (
                    <Link
                      to="/orders"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-sm font-medium transition-colors text-foreground hover:text-primary flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="mt-2 rounded-full"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="mt-2 space-y-2 border-t pt-4">
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
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
