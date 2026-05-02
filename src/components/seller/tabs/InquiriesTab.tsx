import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageCircle, ChevronDown, ChevronUp, MapPin, Calendar, Box } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface InquiriesTabProps {
  inquiries: any[];
  isLoading: boolean;
  updateInquiryStatus: (id: number, status: string) => void;
}

export function InquiriesTab({ inquiries, isLoading, updateInquiryStatus }: InquiriesTabProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredInquiries = inquiries.filter(inq => {
    if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    closed: inquiries.filter(i => i.status === 'closed').length,
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 border-none hover:bg-yellow-100">Pending</Badge>;
      case 'contacted': return <Badge className="bg-blue-100 text-blue-800 border-none hover:bg-blue-100">Contacted</Badge>;
      case 'closed': return <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-100">Fulfilled</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Inquiries', value: stats.total, color: 'border-l-gray-400' },
          { label: 'Pending', value: stats.pending, color: 'border-l-yellow-400' },
          { label: 'Contacted', value: stats.contacted, color: 'border-l-blue-400' },
          { label: 'Fulfilled', value: stats.closed, color: 'border-l-green-400' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-4 border border-[#e5e2df] border-l-4 ${stat.color} rounded-lg shadow-sm`}>
            <p className="text-xs font-bold uppercase tracking-wider text-[#74777d] mb-1">{stat.label}</p>
            <p className="text-2xl font-headline font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white p-2 border border-[#e5e2df] rounded-lg shadow-sm">
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="contacted">Contacted</TabsTrigger>
            <TabsTrigger value="closed">Fulfilled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 border border-[#e5e2df] rounded-lg">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/5" />
            </div>
          ))
        ) : filteredInquiries.length === 0 ? (
          <div className="bg-white py-16 text-center border border-[#e5e2df] rounded-lg shadow-sm">
            <MessageCircle className="w-12 h-12 text-[#74777d] opacity-20 mx-auto mb-4" />
            <p className="text-[#1c1c1a] font-medium">No inquiries found.</p>
            <p className="text-sm text-[#74777d]">Try changing the filters to see more results.</p>
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const isExpanded = expandedId === inq.id;
            
            return (
              <div key={inq.id} className="bg-white border border-[#e5e2df] rounded-lg shadow-sm overflow-hidden transition-all hover:border-[#735c00]/50">
                <div 
                  className="p-4 sm:p-6 cursor-pointer flex flex-col md:flex-row gap-6 md:items-center justify-between"
                  onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {getStatusBadge(inq.status)}
                      <span className="text-xs text-[#74777d] flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(inq.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-headline font-semibold text-[#1c1c1a] line-clamp-1">
                      {inq.supplier_products?.name || "System Component"}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-[#74777d]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-[#1c1c1a]">{inq.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{inq.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5" />
                        <span className="font-medium text-[#735c00]">{inq.quantity} units requested</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={inq.status} 
                      onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                      className="px-3 py-2 border border-[#e5e2df] rounded-md text-sm bg-white outline-none focus:border-[#735c00] transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Fulfilled</option>
                    </select>

                    <div className="flex gap-2">
                      <a 
                        href={`tel:${inq.phone}`} 
                        className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-[#fcf9f6] text-[#1c1c1a] border border-[#e5e2df] rounded-md hover:bg-[#1c1c1a] hover:text-white transition-colors"
                      >
                        <Phone className="w-4 h-4" /> <span className="hidden lg:inline text-sm font-medium">Call</span>
                      </a>
                      <a 
                        href={`https://wa.me/91${inq.phone?.replace(/\D/g,'')}?text=Hi ${inq.name}, I am reaching out regarding your bulk inquiry for ${inq.supplier_products?.name} on BuildBazaarX.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#128C7E] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> <span className="hidden lg:inline text-sm font-medium">WhatsApp</span>
                      </a>
                    </div>
                    
                    <button className="hidden md:flex p-2 text-[#74777d] hover:bg-[#fcf9f6] rounded-full ml-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 py-4 bg-[#fcf9f6] border-t border-[#e5e2df] text-sm animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-[#1c1c1a] mb-2 uppercase text-xs tracking-wider">Buyer Information</h4>
                        <div className="space-y-1 text-[#74777d]">
                          <p><strong className="text-[#1c1c1a]">Name:</strong> {inq.name}</p>
                          <p><strong className="text-[#1c1c1a]">Phone:</strong> {inq.phone}</p>
                          <p><strong className="text-[#1c1c1a]">Location:</strong> {inq.city}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1c1c1a] mb-2 uppercase text-xs tracking-wider">Inquiry Details</h4>
                        <div className="space-y-1 text-[#74777d]">
                          <p><strong className="text-[#1c1c1a]">Product:</strong> {inq.supplier_products?.name || "N/A"}</p>
                          <p><strong className="text-[#1c1c1a]">Quantity:</strong> {inq.quantity} Units</p>
                          <p><strong className="text-[#1c1c1a]">Received:</strong> {new Date(inq.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
