import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Package, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const MobileNav = () => {
  const location = useLocation();
  const { userId } = useAuth();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Designs", path: "/designs", icon: LayoutGrid },
    { name: "Materials", path: "/materials", icon: Package },
    { name: "Profile", path: userId ? "/profile" : "/auth?mode=login", icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#fcf9f6] border-t border-[#e5e2df] z-50 px-6 py-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
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
