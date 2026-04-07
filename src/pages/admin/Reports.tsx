import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { DownloadCloud, Users, Wrench, Package } from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function AdminReports() {
  const { toast } = useToast();

  const { data: chartData, isLoading: isLoadingChart } = useQuery({
    queryKey: ['admin-reports-growth'],
    queryFn: async () => {
      const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5)).toISOString();
      
      const [profiles, pros, designers, suppliers] = await Promise.all([
        supabase.from('profiles').select('created_at, role').gte('created_at', sixMonthsAgo),
        supabase.from('professionals').select('created_at').gte('created_at', sixMonthsAgo),
        supabase.from('designers').select('created_at').gte('created_at', sixMonthsAgo),
        supabase.from('suppliers').select('created_at').gte('created_at', sixMonthsAgo),
      ]);

      const months = Array.from({ length: 6 }, (_, i) => {
        const d = startOfMonth(subMonths(new Date(), 5 - i));
        return { date: d, formatted: format(d, 'MMM yyyy') };
      });

      return months.map(month => {
        const isSameMonth = (isoDate: string) => startOfMonth(new Date(isoDate)).getTime() === month.date.getTime();
        return {
          name: month.formatted,
          customers: profiles.data?.filter(d => d.role === 'customer' && isSameMonth(d.created_at)).length || 0,
          professionals: pros.data?.filter(d => isSameMonth(d.created_at)).length || 0,
          designers: designers.data?.filter(d => isSameMonth(d.created_at)).length || 0,
          suppliers: suppliers.data?.filter(d => isSameMonth(d.created_at)).length || 0,
        };
      });
    }
  });

  const { data: contentStats } = useQuery({
    queryKey: ['admin-reports-content'],
    queryFn: async () => {
      const fetchCount = async (t: string, col?: string, val?: any) => {
        let q = supabase.from(t).select('*', { count: 'exact', head: true });
        if (col && val !== undefined) q = q.eq(col, val);
        const { count } = await q;
        return count || 0;
      };

      const [
        totalDesigns, pubDesigns, draftDesigns, trendDesigns,
        totalProducts, pubProducts, draftProducts, featProducts, outOfStock
      ] = await Promise.all([
        fetchCount('designs'),
        fetchCount('designs', 'is_published', true),
        fetchCount('designs', 'is_published', false),
        fetchCount('designs', 'is_trending', true),
        fetchCount('supplier_products'),
        fetchCount('supplier_products', 'is_published', true),
        fetchCount('supplier_products', 'is_published', false),
        fetchCount('supplier_products', 'is_featured', true),
        fetchCount('supplier_products', 'stock_qty', 0),
      ]);

      return {
        designs: { total: totalDesigns, published: pubDesigns, draft: draftDesigns, trending: trendDesigns },
        products: { total: totalProducts, published: pubProducts, draft: draftProducts, featured: featProducts, outOfStock }
      };
    }
  });

  const toCSV = (data: any[]) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row).map(v => {
        if (v === null || v === undefined) return '""';
        const str = typeof v === 'object' ? JSON.stringify(v) : String(v);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type: 'users' | 'professionals' | 'suppliers') => {
    try {
      let data: any[] | null = [];
      if (type === 'users') {
        const res = await supabase.from('profiles').select('id, full_name, phone, role, is_blocked, created_at');
        data = res.data;
      } else if (type === 'professionals') {
        const res = await supabase.from('professionals').select('*');
        data = res.data;
      } else if (type === 'suppliers') {
        const res = await supabase.from('suppliers').select('*');
        data = res.data;
      }

      if (data && data.length > 0) {
        const csv = toCSV(data);
        downloadCSV(csv, `${type}_export_${format(new Date(), 'yyyyMMdd')}.csv`);
        toast({ title: 'Export successful' });
      } else {
        toast({ title: 'No data to export', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Detailed insights and data exports for the platform.</p>
        </div>

        {/* SECTION A — User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New registrations per month for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoadingChart ? (
              <div className="h-full flex items-center justify-center">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} contentStyle={{ borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="customers" name="Customers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="professionals" name="Professionals" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="designers" name="Designers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="suppliers" name="Suppliers" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* SECTION B — Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">Design Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{contentStats?.designs.total || 0}</p>
                </div>
                <div className="space-y-1 border-l">
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-green-600">{contentStats?.designs.published || 0}</p>
                </div>
                <div className="space-y-1 border-l">
                  <p className="text-sm text-muted-foreground">Draft</p>
                  <p className="text-2xl font-bold text-yellow-600">{contentStats?.designs.draft || 0}</p>
                </div>
                <div className="space-y-1 border-l">
                  <p className="text-sm text-muted-foreground">Trending</p>
                  <p className="text-2xl font-bold text-orange-600">{contentStats?.designs.trending || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">Product Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-5">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{contentStats?.products.total || 0}</p>
                </div>
                <div className="space-y-1 border-l">
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-green-600">{contentStats?.products.published || 0}</p>
                </div>
                <div className="space-y-1 border-l">
                  <p className="text-sm text-muted-foreground">Draft</p>
                  <p className="text-2xl font-bold text-yellow-600">{contentStats?.products.draft || 0}</p>
                </div>
                <div className="space-y-1 border-l">
                  <p className="text-sm text-muted-foreground">Featured</p>
                  <p className="text-2xl font-bold text-blue-600">{contentStats?.products.featured || 0}</p>
                </div>
                <div className="space-y-1 border-l">
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold text-destructive">{contentStats?.products.outOfStock || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION C — Export Data */}
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download platform data in CSV format for external analysis.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1 h-20 flex flex-col gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" variant="outline" onClick={() => handleExport('users')}>
              <Users className="h-5 w-5" />
              <span>Export Users Data</span>
            </Button>
            <Button className="flex-1 h-20 flex flex-col gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" variant="outline" onClick={() => handleExport('professionals')}>
              <Wrench className="h-5 w-5" />
              <span>Export Professionals Data</span>
            </Button>
            <Button className="flex-1 h-20 flex flex-col gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200" variant="outline" onClick={() => handleExport('suppliers')}>
              <Package className="h-5 w-5" />
              <span>Export Suppliers Data</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
