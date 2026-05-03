import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Package, MessageSquare, IndianRupee, ShoppingCart, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OverviewTabProps {
  supplierData: any;
  products: any[];
  orders: any[];
  inquiries: any[];
  setActiveTab: (tab: string) => void;
  settings?: {
    supplierId?: string;
    commissionRate: number;
    payoutStatuses: string[];
  };
}

export function OverviewTab({ supplierData, products, orders, inquiries, setActiveTab, settings }: OverviewTabProps) {
  const activeListings = products.filter(p => p.is_published).length;
  const commissionRate = settings?.commissionRate ?? 0.10;
  const payoutStatuses = settings?.payoutStatuses ?? ['paid', 'pending', 'processing', 'shipped'];
  
  const pendingOrders = orders.filter(o => payoutStatuses.includes(o.status)).length;
  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
  
  const totalGross = orders.reduce((sum, order) => {
    if (order.status === 'cancelled') return sum;
    // Only sum items belonging to this supplier
    const supplierItems = Array.isArray(order.items) 
      ? order.items.filter((item: any) => item.supplier_id === settings?.supplierId)
      : [];
    const supplierTotal = supplierItems.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0);
    return sum + supplierTotal;
  }, 0);

  const totalFees = totalGross * commissionRate;
  const totalRevenue = totalGross - totalFees;

  const revenueData = [
    { name: 'Jan', value: 0 },
    { name: 'Feb', value: 0 },
    { name: 'Mar', value: 0 },
    { name: 'Apr', value: totalRevenue }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!supplierData?.gst_number && (
        <div className="bg-[#fffdfa] border border-[#735c00]/30 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-[#735c00] font-headline font-semibold text-lg">Complete Your Profile</h3>
            <p className="text-sm text-[#74777d]">Please add your GST number to unlock all seller features.</p>
          </div>
          <button 
            onClick={() => setActiveTab('account')}
            className="px-4 py-2 bg-[#735c00] text-white text-sm font-medium rounded-md hover:bg-[#5a4800] transition-colors whitespace-nowrap"
          >
            Update Profile
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Gross Sales', 
            value: `₹${totalGross.toLocaleString()}`, 
            icon: IndianRupee, 
            color: 'text-blue-600', 
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100'
          },
          { 
            label: 'Commission', 
            value: `-₹${totalFees.toLocaleString()}`, 
            icon: ArrowRight, 
            color: 'text-red-600', 
            bgColor: 'bg-red-50',
            borderColor: 'border-red-100'
          },
          { 
            label: 'Net Earnings', 
            value: `₹${totalRevenue.toLocaleString()}`, 
            icon: IndianRupee, 
            color: 'text-emerald-600', 
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-100'
          },
          { 
            label: 'Active Listings', 
            value: activeListings, 
            icon: Package, 
            color: 'text-[#735c00]', 
            bgColor: 'bg-[#fcf9f6]',
            borderColor: 'border-[#e5e2df]'
          },
        ].map((stat, i) => (
          <div key={i} className={`p-6 border ${stat.borderColor} rounded-xl shadow-sm ${stat.bgColor} transition-all hover:shadow-md group`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold uppercase tracking-wider text-[#74777d]">{stat.label}</span>
              <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className={`text-3xl font-headline font-bold ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white border border-[#e5e2df] rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-xl font-semibold">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="text-sm text-[#735c00] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="py-8 text-center text-[#74777d] text-sm">No recent orders.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Net Payout</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                        <TableCell>
                          ₹{(() => {
                            const supplierItems = Array.isArray(order.items) 
                              ? order.items.filter((item: any) => item.supplier_id === settings?.supplierId)
                              : [];
                            const supplierGross = supplierItems.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0);
                            return (supplierGross * (1 - commissionRate)).toLocaleString();
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`capitalize px-3 py-1 rounded-full border ${
                              order.status === 'paid' || order.status === 'delivered' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : order.status === 'pending' || order.status === 'processing'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : order.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white border border-[#e5e2df] rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-xl font-semibold">Recent Inquiries</h3>
            <button onClick={() => setActiveTab('inquiries')} className="text-sm text-[#735c00] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {inquiries.length === 0 ? (
            <div className="py-8 text-center text-[#74777d] text-sm">No recent inquiries.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.slice(0, 5).map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell className="font-medium">{inq.name}</TableCell>
                      <TableCell className="truncate max-w-[150px]">{inq.supplier_products?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {inq.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-[#e5e2df] rounded-lg shadow-sm p-6">
        <h3 className="font-headline text-xl font-semibold mb-6">Revenue Overview</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#735c00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#735c00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#74777d', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#74777d', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${val}`} />
              <CartesianGrid vertical={false} stroke="#e5e2df" strokeDasharray="3 3" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e2df', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#1c1c1a', fontWeight: 'bold' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="value" stroke="#735c00" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
