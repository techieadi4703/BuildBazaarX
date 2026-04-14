import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  User,
  Wrench,
  Palette,
  Package,
  Image as ImageIcon,
  ShoppingBag,
  ClipboardList,
  HeadphonesIcon,
  Tag,
  Layout,
  Settings,
  BarChart2,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: User, label: 'Customers', path: '/admin/customers' },
  { icon: Wrench, label: 'Professionals', path: '/admin/professionals' },
  { icon: Palette, label: 'Designers', path: '/admin/designers' },
  { icon: Package, label: 'Suppliers', path: '/admin/suppliers' },
  { icon: ImageIcon, label: 'Designs', path: '/admin/designs' },
  { icon: ShoppingBag, label: 'Products', path: '/admin/products' },
  { icon: ClipboardList, label: 'Orders', path: '/admin/orders' },
  { icon: HeadphonesIcon, label: 'Support Tickets', path: '/admin/tickets' },
  { icon: Tag, label: 'Coupons', path: '/admin/coupons' },
  { icon: Layout, label: 'Banners', path: '/admin/banners' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: BarChart2, label: 'Reports', path: '/admin/reports' },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email || null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Logged out successfully' });
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-primary">BuildBazaarX <span className="text-foreground">Admin</span></h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative group ${
                isActive 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div
                  className="absolute inset-0 bg-primary/10 rounded-md z-0 transition-all"
                />
              )}
            </Link>
          );
        })}

      </nav>

      <div className="p-4 border-t border-border mt-auto h-[80px]">
        {email && (
          <div className="text-sm font-medium text-muted-foreground mb-3 truncate px-2">
            {email}
          </div>
        )}
        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border z-20">
        <h1 className="text-lg font-bold">BuildBazaarX Admin</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Sidebar overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="relative w-64 max-w-sm h-full bg-background flex-col shadow-xl z-50 animate-in slide-in-from-left-0">
            <div className="absolute top-4 right-4 flex items-center justify-center">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col fixed inset-y-0 z-30">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-[240px]">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
