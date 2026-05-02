import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, CreditCard, Package, Warehouse, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface OrdersTabProps {
  orders: any[];
  isLoading: boolean;
  updateOrderStatus: (id: string, status: string) => void;
  settings?: {
    commissionRate: number;
    payoutStatuses: string[];
  };
}

export function OrdersTab({ orders, isLoading, updateOrderStatus, settings }: OrdersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const commissionRate = settings?.commissionRate ?? 0.10;

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    
    if (searchTerm) {
      const orderIdMatch = order.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const customerNameMatch = order.delivery_address?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return orderIdMatch || customerNameMatch;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-none';
      case 'processing': return 'bg-blue-100 text-blue-800 border-none';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-none';
      case 'delivered': return 'bg-[#735c00] text-white border-none';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-none';
      default: return 'bg-gray-100 text-gray-800 border-none';
    }
  };

  const calculateItemsCount = (items: any) => {
    if (!items) return 0;
    if (Array.isArray(items)) {
      return items.reduce((acc, item) => acc + (item.quantity || 1), 0);
    }
    return 0;
  };

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const getStepIndex = (status: string) => statusSteps.indexOf(status);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto overflow-x-auto border rounded-xl p-1 shrink-0 bg-white">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#74777d]" />
          <Input
            placeholder="Search order ID or name..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-[#e5e2df] rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#fcf9f6]">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product(s)</TableHead>
              <TableHead>Gross Amount</TableHead>
              <TableHead>Net Earnings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[80px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-[#74777d]">
                    <Warehouse className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium text-[#1c1c1a]">No orders yet.</p>
                    <p className="text-sm">Your orders will appear here once buyers purchase your products.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-[#735c00]">
                    #{order.id?.substring(0, 8)}
                  </TableCell>
                  <TableCell>{order.delivery_address?.name || 'Unknown User'}</TableCell>
                  <TableCell>{calculateItemsCount(order.items)} items</TableCell>
                  <TableCell className="font-semibold text-[#1c1c1a]">₹{order.total?.toLocaleString() || 0}</TableCell>
                  <TableCell className="font-bold text-green-700">₹{((order.total || 0) * (1 - commissionRate)).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`capitalize ${getStatusColor(order.status)}`}>
                      {order.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#735c00] hover:text-[#5a4800] hover:bg-[#fcf9f6]"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-[#fcf9f6]">
                        <SheetHeader className="mb-6">
                          <SheetTitle className="font-headline text-2xl">Order Details</SheetTitle>
                          <SheetDescription>Order ID: #{selectedOrder?.id}</SheetDescription>
                        </SheetHeader>
                        
                        {selectedOrder && (
                          <div className="space-y-8">
                            {/* Visual Step Tracker */}
                            <div className="bg-white p-6 rounded-lg border border-[#e5e2df] shadow-sm">
                              <h4 className="font-medium text-sm text-[#1c1c1a] mb-4">Order Status</h4>
                              <div className="relative flex justify-between items-center mb-2">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#e5e2df] rounded-full z-0"></div>
                                <div 
                                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#735c00] rounded-full z-0 transition-all duration-500"
                                  style={{ width: `${(Math.max(0, getStepIndex(selectedOrder.status)) / 3) * 100}%` }}
                                ></div>
                                
                                {statusSteps.map((step, idx) => {
                                  const isActive = getStepIndex(selectedOrder.status) >= idx;
                                  return (
                                    <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'bg-[#735c00] border-[#735c00]' : 'bg-white border-[#e5e2df]'}`}></div>
                                      <span className={`text-[10px] uppercase font-bold tracking-wider absolute top-6 whitespace-nowrap ${isActive ? 'text-[#735c00]' : 'text-[#74777d]'}`}>
                                        {step}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              {selectedOrder.status === 'cancelled' && (
                                <div className="mt-8">
                                  <Badge className="bg-red-100 text-red-800 border-none w-full justify-center py-1">Order Cancelled</Badge>
                                </div>
                              )}
                              
                              {/* Supplier Actions */}
                              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                                <div className="mt-10 pt-4 border-t border-[#e5e2df]">
                                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#74777d] block mb-2">Update Status</label>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      disabled={getStepIndex(selectedOrder.status) >= 1}
                                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                                      className={selectedOrder.status === 'processing' ? 'border-[#735c00] text-[#735c00] bg-[#fffdfa]' : ''}
                                    >
                                      Processing
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      disabled={getStepIndex(selectedOrder.status) >= 2}
                                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                                      className={selectedOrder.status === 'shipped' ? 'border-[#735c00] text-[#735c00] bg-[#fffdfa]' : ''}
                                    >
                                      Shipped
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Customer Info */}
                            <div className="bg-white p-6 rounded-lg border border-[#e5e2df] shadow-sm">
                              <h4 className="font-medium text-sm text-[#1c1c1a] mb-4 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-[#735c00]" /> Customer Details
                              </h4>
                              <div className="text-sm space-y-2 text-[#74777d]">
                                <p><strong className="text-[#1c1c1a]">Name:</strong> {selectedOrder.delivery_address?.name}</p>
                                {selectedOrder.delivery_address && (
                                  <>
                                    <p><strong className="text-[#1c1c1a]">Phone:</strong> {selectedOrder.delivery_address.phone}</p>
                                    <p className="flex items-start gap-1">
                                      <strong className="text-[#1c1c1a]">Address:</strong> 
                                      <span>{selectedOrder.delivery_address.street}, {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} - {selectedOrder.delivery_address.pincode}</span>
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Items List */}
                            <div className="bg-white p-6 rounded-lg border border-[#e5e2df] shadow-sm">
                              <h4 className="font-medium text-sm text-[#1c1c1a] mb-4 flex items-center gap-2">
                                <Package className="h-4 w-4 text-[#735c00]" /> Ordered Items
                              </h4>
                              <div className="space-y-4">
                                {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-start gap-4 pb-4 border-b border-[#fcf9f6] last:border-0 last:pb-0">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover border border-[#e5e2df]" />
                                    ) : (
                                      <div className="w-16 h-16 rounded-md bg-[#fcf9f6] border border-[#e5e2df] flex items-center justify-center">
                                        <Package className="w-6 h-6 text-[#74777d] opacity-50" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-[#1c1c1a] text-sm truncate">{item.name}</p>
                                      <p className="text-xs text-[#74777d] mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="font-semibold text-sm">
                                      ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                                
                                <div className="space-y-2 pt-4 border-t border-[#e5e2df]">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm text-[#74777d]">Gross Total</span>
                                    <span className="font-medium text-sm text-[#1c1c1a]">₹{selectedOrder.total?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm text-red-600">Commission ({commissionRate * 100}%)</span>
                                    <span className="font-medium text-sm text-red-600">-₹{(selectedOrder.total * commissionRate).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#f0efee]">
                                    <span className="font-bold text-[#1c1c1a]">Your Net Payout</span>
                                    <span className="font-headline font-bold text-xl text-[#735c00]">₹{(selectedOrder.total * (1 - commissionRate)).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white p-6 rounded-lg border border-[#e5e2df] shadow-sm">
                              <h4 className="font-medium text-sm text-[#1c1c1a] mb-4 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-[#735c00]" /> Payment Method
                              </h4>
                              <p className="text-sm capitalize font-medium">{selectedOrder.payment_method || 'Razorpay'}</p>
                            </div>
                            
                          </div>
                        )}
                      </SheetContent>
                    </Sheet>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
