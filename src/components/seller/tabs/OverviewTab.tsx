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
    return sum + (order.total || 0);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross Sales', value: `₹${totalGross.toLocaleString()}`, icon: IndianRupee, color: 'text-blue-600' },
          { label: 'Platform Fees', value: `-₹${totalFees.toLocaleString()}`, icon: ArrowRight, color: 'text-red-600' },
          { label: 'Net Earnings', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600' },
          { label: 'Active Listings', value: activeListings, icon: Package, color: 'text-[#735c00]' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-[#e5e2df] rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#74777d]">{stat.label}</span>
              <div className={`w-8 h-8 rounded-full bg-[#fcf9f6] flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-headline font-semibold text-[#1c1c1a]">{stat.value}</h3>
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
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                        <TableCell>₹{((order.total || 0) * (1 - commissionRate)).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`capitalize ${order.status === 'pending' || order.status === 'paid' ? 'bg-yellow-100 text-yellow-800' : ''}`}>
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
