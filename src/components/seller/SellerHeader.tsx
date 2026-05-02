import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  setIsMobileOpen: (open: boolean) => void;
  supplierName: string;
  activeTabTitle: string;
}

export function SellerHeader({ setIsMobileOpen, supplierName, activeTabTitle }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-[#e5e2df] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 hover:bg-[#fcf9f6] rounded-md text-[#74777d] transition-colors"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-headline font-semibold text-[#1c1c1a]">
          {activeTabTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-[#74777d] hover:bg-[#fcf9f6] rounded-full relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#735c00] rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-[#e5e2df]">
          <div className="w-8 h-8 rounded-full bg-[#fcf9f6] border border-[#e5e2df] flex items-center justify-center text-[#735c00] font-bold text-sm">
            {supplierName ? supplierName.charAt(0).toUpperCase() : 'S'}
          </div>
          <span className="text-sm font-medium text-[#1c1c1a] hidden md:block">
            {supplierName || 'Supplier'}
          </span>
        </div>
      </div>
    </header>
  );
}
