import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Search, Settings, ShieldAlert, ShieldCheck, Eye, ShoppingCart, Phone, Mail, MapPin } from 'lucide-react';
import { format } from 'date-fns';

type AdminUser = {
  id: string;
  role: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  isBlocked: boolean;
  createdAt: string;
  profile: any;
  customer: any;
  professional: any;
  designer: any;
  supplier: any;
  orders: any[];
};

const PAGE_SIZE = 20;

const safeArray = <T,>(value: T[] | null | undefined) => value ?? [];

const safeDate = (value?: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : format(parsed, 'MMM d, yyyy');
};

const getRoleFromSources = (profile: any, professional: any, designer: any, supplier: any) => {
  if (profile?.role === 'admin') return 'admin';
  if (professional) return 'professional';
  if (designer) return 'designer';
  if (supplier) return 'supplier';
  return 'customer';
};

const getDisplayName = ({ profile, customer, professional, designer, supplier }: any) => {
  return (
    profile?.full_name ||
    customer?.full_name ||
    professional?.full_name ||
    designer?.full_name ||
    supplier?.owner_name ||
    supplier?.business_name ||
    'N/A'
  );
};

const getEmail = ({ profile, professional, designer, supplier }: any) => {
  return profile?.email || professional?.email || designer?.email || supplier?.email || null;
};

const getPhone = ({ profile, customer, professional, designer, supplier }: any) => {
  return profile?.phone || customer?.phone || professional?.phone || designer?.phone || supplier?.phone || null;
};

const getJoinedAt = ({ profile, customer, professional, designer, supplier }: any) => {
  return profile?.created_at || customer?.created_at || professional?.created_at || designer?.created_at || supplier?.created_at || new Date().toISOString();
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
    const prevDate = new Date(sorted[index].created_at).getTime();
    const currentDate = new Date(order.created_at).getTime();
    return sum + (currentDate - prevDate) / (1000 * 60 * 60 * 24);
  }, 0);

  const avgDays = totalGapDays / (sorted.length - 1);
  if (avgDays <= 14) return 'Very frequent';
  if (avgDays <= 30) return 'Monthly';
  if (avgDays <= 90) return 'Occasional';
  return `Every ${Math.round(avgDays)} days`;
};

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-unified'],
    queryFn: async () => {
      const [
        profilesRes,
        customersRes,
        professionalsRes,
        designersRes,
        suppliersRes,
        ordersRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('professionals').select('*'),
        supabase.from('designers').select('*'),
        supabase.from('suppliers').select('*'),
        supabase.from('orders').select('id, user_id, total, status, items, created_at').order('created_at', { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (customersRes.error) throw customersRes.error;
      if (professionalsRes.error) throw professionalsRes.error;
      if (designersRes.error) throw designersRes.error;
      if (suppliersRes.error) throw suppliersRes.error;
      if (ordersRes.error && ordersRes.error.code !== '42P01') throw ordersRes.error;

      const profiles = safeArray(profilesRes.data);
      const customers = safeArray(customersRes.data);
      const professionals = safeArray(professionalsRes.data);
      const designers = safeArray(designersRes.data);
      const suppliers = safeArray(suppliersRes.data);
      const orders = safeArray(ordersRes.data);

      const profilesById = new Map(profiles.map((item: any) => [item.id, item]));
      const customersById = new Map(customers.map((item: any) => [item.id, item]));
      const professionalsById = new Map(professionals.map((item: any) => [item.id, item]));
      const designersById = new Map(designers.map((item: any) => [item.id, item]));
      const suppliersById = new Map(suppliers.map((item: any) => [item.id, item]));
      const ordersByUserId = new Map<string, any[]>();

      orders.forEach((order: any) => {
        const existing = ordersByUserId.get(order.user_id) ?? [];
        existing.push(order);
        ordersByUserId.set(order.user_id, existing);
      });

      const ids = new Set<string>([
        ...profiles.map((item: any) => item.id),
        ...customers.map((item: any) => item.id),
        ...professionals.map((item: any) => item.id),
        ...designers.map((item: any) => item.id),
        ...suppliers.map((item: any) => item.id),
      ]);

      const users: AdminUser[] = Array.from(ids).map((id) => {
        const profile = profilesById.get(id) ?? null;
        const customer = customersById.get(id) ?? null;
        const professional = professionalsById.get(id) ?? null;
        const designer = designersById.get(id) ?? null;
        const supplier = suppliersById.get(id) ?? null;

        return {
          id,
          role: getRoleFromSources(profile, professional, designer, supplier),
          displayName: getDisplayName({ profile, customer, professional, designer, supplier }),
          email: getEmail({ profile, professional, designer, supplier }),
          phone: getPhone({ profile, customer, professional, designer, supplier }),
          isBlocked: Boolean(profile?.is_blocked),
          createdAt: getJoinedAt({ profile, customer, professional, designer, supplier }),
          profile,
          customer,
          professional,
          designer,
          supplier,
          orders: ordersByUserId.get(id) ?? [],
        };
      });

      return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, is_blocked }: { id: string; is_blocked: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_blocked }).eq('id', id);
      if (error) throw error;

      if (is_blocked) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from('admin_logs').insert({
            admin_id: session.user.id,
            action: 'block_user',
            target_type: 'user',
            target_id: id,
            details: { is_blocked: true },
          });
        }
      }
    },
    onSuccess: () => {
      toast({ title: 'User status updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-users-unified'] });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update user', description: error.message, variant: 'destructive' });
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'User role updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-users-unified'] });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to change role', description: error.message, variant: 'destructive' });
    },
  });

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return safeArray(data).filter((user) => {
      if (roleFilter !== 'all' && `${user.role}s` !== roleFilter) return false;
      if (!term) return true;

      return [user.displayName, user.email, user.phone, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [data, roleFilter, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const from = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(from, from + PAGE_SIZE);
  }, [filteredUsers, page]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const cartItems = parseCartItems(selectedUser?.profile?.last_cart_snapshot);
  const cartItemCount = cartItems.reduce((sum: number, item: any) => sum + Number(item.quantity || 1), 0);
  const cartValue = cartItems.reduce((sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const customerOrders = selectedUser?.orders ?? [];
  const totalSpent = customerOrders
    .filter((order: any) => order.status !== 'cancelled')
    .reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
  const lastOrder = customerOrders[0] ?? null;
  const avgOrderValue = customerOrders.length ? totalSpent / customerOrders.length : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage all registered users and their platform access.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs
            defaultValue="all"
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val);
              setPage(1);
            }}
            className="w-full md:w-auto overflow-x-auto border border-white/20 rounded-xl p-1 glass-subtle shadow-glass"
          >
            <TabsList className="bg-transparent border-none h-auto p-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10 dark:data-[state=active]:bg-white/5 data-[state=active]:border-white/20">All</TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-white/10 dark:data-[state=active]:bg-white/5 data-[state=active]:border-white/20">Customers</TabsTrigger>
              <TabsTrigger value="professionals" className="data-[state=active]:bg-white/10 dark:data-[state=active]:bg-white/5 data-[state=active]:border-white/20">Professionals</TabsTrigger>
              <TabsTrigger value="designers" className="data-[state=active]:bg-white/10 dark:data-[state=active]:bg-white/5 data-[state=active]:border-white/20">Designers</TabsTrigger>
              <TabsTrigger value="suppliers" className="data-[state=active]:bg-white/10 dark:data-[state=active]:bg-white/5 data-[state=active]:border-white/20">Suppliers</TabsTrigger>
              <TabsTrigger value="admins" className="data-[state=active]:bg-white/10 dark:data-[state=active]:bg-white/5 data-[state=active]:border-white/20">Admins</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="border border-white/20 rounded-xl glass shadow-glass">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email/Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading users...</TableCell></TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No users found.</TableCell></TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.displayName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{user.email || '—'}</span>
                        <span className="text-xs text-muted-foreground">{user.phone || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBlocked ? (
                        <Badge variant="destructive" className="flex w-fit items-center gap-1"><ShieldAlert className="h-3 w-3" /> Blocked</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 flex w-fit items-center gap-1 backdrop-blur-sm rounded-full"><ShieldCheck className="h-3 w-3" /> Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{safeDate(user.createdAt)}</TableCell>
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
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setSelectedUser(user)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>User Details</SheetTitle>
                              </SheetHeader>
                              {selectedUser && (
                                <div className="mt-6 space-y-6">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{selectedUser.displayName}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Role</p>
                                        <p className="font-medium capitalize">{selectedUser.role}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Joined</p>
                                        <p className="font-medium">{safeDate(selectedUser.createdAt)}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <p className="font-medium">{selectedUser.isBlocked ? 'Blocked' : 'Active'}</p>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Contact Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="flex items-center gap-3 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedUser.email || 'No email available'}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedUser.phone || 'No mobile number available'}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                          {[
                                            selectedUser.profile?.address,
                                            selectedUser.profile?.city,
                                            selectedUser.profile?.state,
                                            selectedUser.profile?.pincode,
                                          ].filter(Boolean).join(', ') || 'No address available'}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {selectedUser.role === 'customer' && (
                                    <>
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Customer Activity</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                          <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">Total Orders</p>
                                            <p className="text-2xl font-bold">{customerOrders.length}</p>
                                          </div>
                                          <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">Total Spend</p>
                                            <p className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</p>
                                          </div>
                                          <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">Average Order</p>
                                            <p className="text-2xl font-bold">₹{Math.round(avgOrderValue).toLocaleString('en-IN')}</p>
                                          </div>
                                          <div className="rounded-lg border p-4">
                                            <p className="text-sm text-muted-foreground">Order Frequency</p>
                                            <p className="text-lg font-semibold">{calculateOrderFrequency(customerOrders)}</p>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Latest Order Snapshot</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                          {lastOrder ? (
                                            <>
                                              <p><span className="font-medium">Last Order Date:</span> {safeDate(lastOrder.created_at)}</p>
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
                                            <div className="rounded-lg border p-4">
                                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <ShoppingCart className="h-4 w-4" /> Items in Cart
                                              </div>
                                              <p className="text-2xl font-bold">{cartItemCount}</p>
                                            </div>
                                            <div className="rounded-lg border p-4">
                                              <p className="text-sm text-muted-foreground">Cart Value</p>
                                              <p className="text-2xl font-bold">₹{cartValue.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="rounded-lg border p-4">
                                              <p className="text-sm text-muted-foreground">Last Updated</p>
                                              <p className="text-base font-semibold">{safeDate(selectedUser.profile?.last_cart_updated_at)}</p>
                                            </div>
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
                                                    <p className="text-muted-foreground">₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-sm text-muted-foreground">No cart items were saved for the latest visit.</p>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </>
                                  )}

                                  {selectedUser.role === 'professional' && selectedUser.professional && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Professional Details</CardTitle>
                                      </CardHeader>
                                      <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
                                        <p><span className="font-medium">Profession:</span> {selectedUser.professional.profession || '—'}</p>
                                        <p><span className="font-medium">City:</span> {selectedUser.professional.city || '—'}</p>
                                        <p><span className="font-medium">Experience:</span> {selectedUser.professional.years_experience || selectedUser.professional.experience_years || 0} years</p>
                                        <p><span className="font-medium">Verified:</span> {selectedUser.professional.is_verified ? 'Yes' : 'No'}</p>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {selectedUser.role === 'designer' && selectedUser.designer && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Designer Details</CardTitle>
                                      </CardHeader>
                                      <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
                                        <p><span className="font-medium">City:</span> {selectedUser.designer.city || '—'}</p>
                                        <p><span className="font-medium">Total Designs:</span> {selectedUser.designer.total_designs || 0}</p>
                                        <p><span className="font-medium">Verified:</span> {selectedUser.designer.is_verified ? 'Yes' : 'No'}</p>
                                        <p><span className="font-medium">Specializations:</span> {selectedUser.designer.specializations?.join(', ') || '—'}</p>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {selectedUser.role === 'supplier' && selectedUser.supplier && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Supplier Details</CardTitle>
                                      </CardHeader>
                                      <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
                                        <p><span className="font-medium">Business:</span> {selectedUser.supplier.business_name || '—'}</p>
                                        <p><span className="font-medium">Owner:</span> {selectedUser.supplier.owner_name || '—'}</p>
                                        <p><span className="font-medium">Type:</span> {selectedUser.supplier.business_type || '—'}</p>
                                        <p><span className="font-medium">Products:</span> {selectedUser.supplier.total_products || 0}</p>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>

                          <DropdownMenuItem
                            onClick={() => roleMutation.mutate({ id: user.id, role: user.role === 'admin' ? 'customer' : 'admin' })}
                            disabled={user.role !== 'admin' && user.role !== 'customer'}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            {user.role === 'admin' ? 'Make Customer' : 'Make Admin'}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className={user.isBlocked ? 'text-green-600 focus:text-green-600' : 'text-destructive focus:text-destructive'}
                            onClick={() => blockMutation.mutate({ id: user.id, is_blocked: !user.isBlocked })}
                          >
                            {user.isBlocked ? <ShieldCheck className="mr-2 h-4 w-4" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                            {user.isBlocked ? 'Unblock User' : 'Block User'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
