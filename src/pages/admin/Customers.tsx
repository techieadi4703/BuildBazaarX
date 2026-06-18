import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Search, Eye, Mail, Phone, MapPin, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

type CustomerRecord = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  isBlocked: boolean;
  createdAt: string;
  profile: any;
  customer: any;
  orders: any[];
};

const safeArray = <T,>(value: T[] | null | undefined) => value ?? [];

const safeDate = (value?: string | null, pattern = 'MMM d, yyyy') => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : format(parsed, pattern);
};

const parseCartItems = (snapshot: any) => {
  if (!snapshot) return [];
  if (Array.isArray(snapshot)) return snapshot;
  if (typeof snapshot === 'string') {
    try {
      const parsed = JSON.parse(snapshot);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const calculateOrderFrequency = (orders: any[]) => {
  if (orders.length <= 1) return 'First-time customer';
  const sorted = [...orders].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const totalGapDays = sorted.slice(1).reduce((sum, order, index) => {
    const prev = new Date(sorted[index].created_at).getTime();
    const curr = new Date(order.created_at).getTime();
    return sum + (curr - prev) / (1000 * 60 * 60 * 24);
  }, 0);

  const avgDays = totalGapDays / (sorted.length - 1);
  if (avgDays <= 14) return 'Very frequent';
  if (avgDays <= 30) return 'Monthly';
  if (avgDays <= 90) return 'Occasional';
  return `Every ${Math.round(avgDays)} days`;
};

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const [profilesRes, customersRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'customer'),
        supabase.from('customers').select('*'),
        supabase.from('orders').select('id, user_id, total, status, items, created_at').order('created_at', { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (customersRes.error) throw customersRes.error;
      if (ordersRes.error && ordersRes.error.code !== '42P01') throw ordersRes.error;

      const profiles = safeArray(profilesRes.data);
      const customerRows = safeArray(customersRes.data);
      const orders = safeArray(ordersRes.data);

      const customersById = new Map(customerRows.map((item: any) => [item.id, item]));
      const ordersByUserId = new Map<string, any[]>();

      orders.forEach((order: any) => {
        const existing = ordersByUserId.get(order.user_id) ?? [];
        existing.push(order);
        ordersByUserId.set(order.user_id, existing);
      });

      return profiles.map((profile: any) => {
        const customer = customersById.get(profile.id) ?? null;

        return {
          id: profile.id,
          fullName: profile.full_name || customer?.full_name || 'N/A',
          email: profile.email || customer?.email || null,
          phone: profile.phone || customer?.phone || null,
          isBlocked: Boolean(profile.is_blocked),
          createdAt: profile.created_at || customer?.created_at || new Date().toISOString(),
          profile,
          customer,
          orders: ordersByUserId.get(profile.id) ?? [],
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as CustomerRecord[];
    },
  });

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return safeArray(customers).filter((customer) => {
      if (!term) return true;
      return [customer.fullName, customer.email, customer.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [customers, searchTerm]);

  const selectedOrders = selectedCustomer?.orders ?? [];
  const totalSpent = selectedOrders
    .filter((order: any) => order.status !== 'cancelled')
    .reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
  const avgOrderValue = selectedOrders.length ? totalSpent / selectedOrders.length : 0;
  const lastOrder = selectedOrders[0] ?? null;
  const cartItems = parseCartItems(selectedCustomer?.profile?.last_cart_snapshot);
  const cartItemCount = cartItems.reduce((sum: number, item: any) => sum + Number(item.quantity || 1), 0);
  const cartValue = cartItems.reduce((sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Track customer details, order activity, and last-visit cart behavior.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border rounded-lg bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Last Cart</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading customers...</TableCell></TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No customers found.</TableCell></TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const items = parseCartItems(customer.profile?.last_cart_snapshot);
                  const itemsCount = items.reduce((sum: number, item: any) => sum + Number(item.quantity || 1), 0);

                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.fullName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{customer.email || '—'}</span>
                          <span className="text-xs text-muted-foreground">{customer.phone || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{customer.orders.length} total</span>
                          <span className="text-xs text-muted-foreground price-display">₹{customer.orders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0).toLocaleString('en-IN')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{calculateOrderFrequency(customer.orders)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{itemsCount} items</span>
                          <span className="text-xs text-muted-foreground">{safeDate(customer.profile?.last_cart_updated_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{safeDate(customer.createdAt)}</TableCell>
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
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setSelectedCustomer(customer)}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                              </SheetTrigger>
                              <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                                <SheetHeader>
                                  <SheetTitle>Customer Details</SheetTitle>
                                </SheetHeader>
                                {selectedCustomer && (
                                  <div className="mt-6 space-y-6">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Customer Details</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span>{selectedCustomer.email || 'No email available'}</span></div>
                                        <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{selectedCustomer.phone || 'No mobile number available'}</span></div>
                                        <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{[
                                          selectedCustomer.profile?.address,
                                          selectedCustomer.profile?.city,
                                          selectedCustomer.profile?.state,
                                          selectedCustomer.profile?.pincode,
                                        ].filter(Boolean).join(', ') || 'No address available'}</span></div>
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Order Activity</CardTitle>
                                      </CardHeader>
                                      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{selectedOrders.length}</p></div>
                                        <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Total Spend</p><p className="text-2xl font-bold price-display">₹{totalSpent.toLocaleString('en-IN')}</p></div>
                                        <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Average Order</p><p className="text-2xl font-bold price-display">₹{Math.round(avgOrderValue).toLocaleString('en-IN')}</p></div>
                                        <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Order Frequency</p><p className="text-lg font-semibold">{calculateOrderFrequency(selectedOrders)}</p></div>
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Latest Order Snapshot</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2 text-sm">
                                        {lastOrder ? (
                                          <>
                                            <p><span className="font-medium">Last Order Date:</span> {safeDate(lastOrder.created_at, 'MMM d, yyyy, p')}</p>
                                            <p><span className="font-medium">Last Order Status:</span> <span className="capitalize">{lastOrder.status || 'pending'}</span></p>
                                            <p><span className="font-medium">Last Order Value:</span> ₹{Number(lastOrder.total || 0).toLocaleString('en-IN')}</p>
                                          </>
                                        ) : (
                                          <p className="text-muted-foreground">No orders placed yet.</p>
                                        )}
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Last Visit Cart</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-3">
                                          <div className="rounded-lg border p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><ShoppingCart className="h-4 w-4" /> Items in Cart</div><p className="text-2xl font-bold">{cartItemCount}</p></div>
                                          <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Cart Value</p><p className="text-2xl font-bold price-display">₹{cartValue.toLocaleString('en-IN')}</p></div>
                                          <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Last Updated</p><p className="text-base font-semibold">{safeDate(selectedCustomer.profile?.last_cart_updated_at, 'MMM d, yyyy, p')}</p></div>
                                        </div>

                                        {cartItems.length > 0 ? (
                                          <div className="space-y-2">
                                            {cartItems.slice(0, 5).map((item: any, index: number) => (
                                              <div key={`${item.id ?? item.name}-${index}`} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                                                <div>
                                                  <p className="font-medium">{item.name || 'Unnamed item'}</p>
                                                  <p className="text-muted-foreground">{item.brand || 'No brand'}</p>
                                                </div>
                                                <div className="text-right">
                                                  <p>Qty: {item.quantity || 1}</p>
                                                  <p className="text-muted-foreground price-display">₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-muted-foreground">No cart items were saved for the latest visit.</p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>
                                )}
                              </SheetContent>
                            </Sheet>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
