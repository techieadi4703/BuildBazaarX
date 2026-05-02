import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, IndianRupee, UserCircle, HelpCircle, X, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  pendingInquiriesCount: number;
  handleLogout: () => void;
}

export function SellerSidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen, pendingInquiriesCount, handleLogout }: SidebarProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'My Listings', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare, badge: pendingInquiriesCount },
    { id: 'payments', label: 'Payments', icon: IndianRupee },
    { id: 'account', label: 'Account', icon: UserCircle },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e5e2df] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-[#e5e2df]">
          <span className="font-headline italic text-xl text-[#735c00] font-bold">BuildBazaarX.</span>
          <button className="lg:hidden" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5 text-[#74777d]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-[#fcf9f6] text-[#735c00] font-semibold' 
                    : 'text-[#74777d] hover:bg-[#fcf9f6] hover:text-[#1c1c1a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#735c00]' : 'text-[#74777d]'}`} />
                  <span className="text-sm">{tab.label}</span>
                </div>
                {!!tab.badge && tab.badge > 0 ? (
                  <Badge className="bg-[#735c00] text-white text-[10px] px-1.5 py-0 min-w-[20px] flex items-center justify-center border-none">
                    {tab.badge}
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#e5e2df] shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#74777d] hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
