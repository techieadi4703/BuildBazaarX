import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, subDays, startOfDay, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

const fetchCount = async (table: string, filter?: { column: string; value: any }) => {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count, error } = await query;
  if (error) console.error(error);
  return count || 0;
};

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        customers, professionals, designers, suppliers,
        publishedDesigns, publishedProducts, openTickets
      ] = await Promise.all([
        fetchCount('profiles', { column: 'role', value: 'customer' }),
        fetchCount('professionals'),
        fetchCount('designers'),
        fetchCount('suppliers'),
        fetchCount('designs', { column: 'is_published', value: true }),
        fetchCount('supplier_products', { column: 'is_published', value: true }),
        fetchCount('support_tickets', { column: 'status', value: 'open' }),
      ]);
      return { customers, professionals, designers, suppliers, publishedDesigns, publishedProducts, openTickets };
    }
  });

  const { data: recentUsers } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10);
      return data || [];
    }
  });

  const { data: pendingStats } = useQuery({
    queryKey: ['admin-pending'],
    queryFn: async () => {
      const [professionals, designers, suppliers, designs, products] = await Promise.all([
        fetchCount('professionals', { column: 'is_verified', value: false }),
        fetchCount('designers', { column: 'is_verified', value: false }),
        fetchCount('suppliers', { column: 'is_verified', value: false }),
        fetchCount('designs', { column: 'is_published', value: false }),
        fetchCount('supplier_products', { column: 'is_published', value: false }),
      ]);
      return { professionals, designers, suppliers, designs, products };
    }
  });

  const { data: chartData } = useQuery({
    queryKey: ['admin-chart-data'],
    queryFn: async () => {
      const sevenDaysAgo = startOfDay(subDays(new Date(), 6)).toISOString();
      const [profiles, pros, designers, suppliers] = await Promise.all([
        supabase.from('profiles').select('created_at').eq('role', 'customer').gte('created_at', sevenDaysAgo),
        supabase.from('professionals').select('created_at').gte('created_at', sevenDaysAgo),
        supabase.from('designers').select('created_at').gte('created_at', sevenDaysAgo),
        supabase.from('suppliers').select('created_at').gte('created_at', sevenDaysAgo),
      ]);

      const days = Array.from({ length: 7 }, (_, i) => {
        const d = startOfDay(subDays(new Date(), 6 - i));
        return { date: d, formatted: format(d, 'EEE') };
      });

      return days.map(day => {
        const isSameDay = (isoDate: string) => startOfDay(parseISO(isoDate)).getTime() === day.date.getTime();
        return {
          name: day.formatted,
          customers: profiles.data?.filter(d => isSameDay(d.created_at)).length || 0,
          professionals: pros.data?.filter(d => isSameDay(d.created_at)).length || 0,
          designers: designers.data?.filter(d => isSameDay(d.created_at)).length || 0,
          suppliers: suppliers.data?.filter(d => isSameDay(d.created_at)).length || 0,
        };
      });
    }
  });

  const pieData = stats ? [
    { name: 'Designs', value: stats.publishedDesigns },
    { name: 'Products', value: stats.publishedProducts },
    { name: 'Professionals', value: stats.professionals },
    { name: 'Designers', value: stats.designers },
  ] : [];

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>

        {/* Top Row - 4 Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.customers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Professionals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.professionals || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Designers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.designers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.suppliers || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - 3 Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Designs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.publishedDesigns || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.publishedProducts || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openTickets || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>New Registrations (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={2} name="Customers" />
                  <Line type="monotone" dataKey="professionals" stroke="#10b981" strokeWidth={2} name="Professionals" />
                  <Line type="monotone" dataKey="designers" stroke="#8b5cf6" strokeWidth={2} name="Designers" />
                  <Line type="monotone" dataKey="suppliers" stroke="#f97316" strokeWidth={2} name="Suppliers" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Content by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recently Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers?.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name || 'No Name'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.role}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(u.created_at), 'PPP')}</TableCell>
                      </TableRow>
                    ))}
                    {!recentUsers?.length && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">No recent users.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Items needing admin review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Professionals</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{pendingStats?.professionals || 0}</Badge>
                    <Link to="/admin/professionals" className="text-xs text-primary hover:underline">Review</Link>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Designers</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{pendingStats?.designers || 0}</Badge>
                    <Link to="/admin/designers" className="text-xs text-primary hover:underline">Review</Link>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Suppliers</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{pendingStats?.suppliers || 0}</Badge>
                    <Link to="/admin/suppliers" className="text-xs text-primary hover:underline">Review</Link>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Designs</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{pendingStats?.designs || 0}</Badge>
                    <Link to="/admin/designs" className="text-xs text-primary hover:underline">Review</Link>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-medium">Products</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{pendingStats?.products || 0}</Badge>
                    <Link to="/admin/products" className="text-xs text-primary hover:underline">Review</Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
