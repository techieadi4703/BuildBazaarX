import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Search, Eye, MapPin, CreditCard, Package } from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async (): Promise<any[]> => {
      // Ensure orders table exists in your DB or this will fail gracefully
      const { data, error } = await supabase
        .from('orders')
        .select(`*`)
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet, return empty array
          return [];
        }
        throw error;
      }
      return data || [];
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Order status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  });

  const filteredData = orders?.filter(order => {
    // Status filter
    if (filterTab !== 'all' && order.status !== filterTab) return false;

    // Date filter
    if (dateFilter !== 'all') {
      const date = parseISO(order.created_at);
      if (dateFilter === 'today' && !isToday(date)) return false;
      if (dateFilter === 'week' && !isThisWeek(date)) return false;
      if (dateFilter === 'month' && !isThisMonth(date)) return false;
    }

    // Search filter
    if (searchTerm) {
      const orderIdMatch = order.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const customerNameMatch = order.delivery_address?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return orderIdMatch || customerNameMatch;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'dispatched': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateItemsCount = (items: any) => {
    if (!items) return 0;
    if (Array.isArray(items)) {
      return items.reduce((acc, item) => acc + (item.quantity || 1), 0);
    }
    return 0;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillments.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs defaultValue="all" value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto overflow-x-auto border rounded-lg p-1 shrink-0">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 items-center">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order ID or name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredData?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No orders found.</TableCell></TableRow>
              ) : (
                filteredData?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-primary">
                      #{order.id?.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      {order.delivery_address?.name || 'Unknown User'}
                    </TableCell>
                    <TableCell>
                      {calculateItemsCount(order.items)} items
                    </TableCell>
                    <TableCell className="font-semibold price-display">₹{order.total?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`capitalize ${getStatusColor(order.status)}`}>
                        {order.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(order.created_at), 'dd MMM yyyy, p')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Sheet>
                            <SheetTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setSelectedOrder(order)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Order Details</SheetTitle>
                                <SheetDescription>Order ID: #{selectedOrder?.id}</SheetDescription>
                              </SheetHeader>
                              
                              {selectedOrder && (
                                <div className="mt-6 space-y-6">
                                  {/* Status */}
                                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <span className="font-medium">Current Status:</span>
                                    <Badge className={`capitalize ${getStatusColor(selectedOrder.status)}`}>
                                      {selectedOrder.status}
                                    </Badge>
                                  </div>

                                  {/* Customer Info */}
                                  <div>
                                    <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-muted-foreground" /> Delivery Details
                                    </h4>
                                    <div className="text-sm space-y-1 p-3 border rounded-md">
                                      <p><span className="font-medium">Name:</span> {selectedOrder.delivery_address?.name}</p>
                                      {selectedOrder.delivery_address && (
                                        <>
                                          <p><span className="font-medium">Address:</span> {selectedOrder.delivery_address.street}</p>
                                          <p><span className="font-medium">City/State:</span> {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} {selectedOrder.delivery_address.pincode}</p>
                                          <p><span className="font-medium">Phone:</span> {selectedOrder.delivery_address.phone}</p>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Payment Info */}
                                  <div>
                                    <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                                      <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment Method
                                    </h4>
                                    <p className="text-sm p-3 border rounded-md capitalize">{selectedOrder.payment_method || 'N/A'}</p>
                                  </div>

                                  {/* Items List */}
                                  <div>
                                    <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                                      <Package className="h-4 w-4 text-muted-foreground" /> Order Items
                                    </h4>
                                    <div className="space-y-3">
                                      {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 border rounded-md text-sm">
                                          {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" loading="lazy" decoding="async" />}
                                          <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                          </div>
                                          <div className="font-semibold price-display">₹{(item.price * (item.quantity || 1)).toLocaleString()}
                                          </div>
                                        </div>
                                      ))}
                                      
                                      <div className="flex justify-between items-center p-3 border-t">
                                        <span className="font-bold">Total Amount</span>
                                        <span className="font-bold text-lg price-display">₹{selectedOrder.total?.toLocaleString() || 0}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-6">
                                    <h4 className="font-medium text-sm mb-2">Update Status</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(status => (
                                        <Button 
                                          key={status}
                                          size="sm" 
                                          variant={selectedOrder.status === status ? "default" : "outline"}
                                          onClick={() => statusMutation.mutate({ id: selectedOrder.id, status })}
                                          disabled={selectedOrder.status === status}
                                        >
                                          {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>

                                </div>
                              )}
                            </SheetContent>
                          </Sheet>

                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Quick Update</div>
                          {['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(status => (
                            <DropdownMenuItem 
                              key={status} 
                              disabled={order.status === status}
                              onClick={() => statusMutation.mutate({ id: order.id, status })}
                              className="capitalize"
                            >
                              Mark as {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
