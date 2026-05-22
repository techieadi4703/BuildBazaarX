import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Package, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const MobileNav = () => {
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Designs", path: "/designs", icon: LayoutGrid },
    { name: "Materials", path: "/materials", icon: Package },
    { name: "Profile", path: userId ? "/profile" : "/auth?mode=login", icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-subtle border-t border-white/30 z-50 px-6 py-2 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-between px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.name === 'Profile' && location.pathname.startsWith('/profile'));
          return (
            <Link
              key={item.name}
              to={item.path}
              className="relative flex flex-col items-center gap-1 py-1"
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#735c00] text-white shadow-lg' : 'text-[#74777d] hover:text-[#1c1c1a] hover:bg-[#e5e2df]/50'}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${isActive ? 'text-[#735c00]' : 'text-[#74777d]'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
