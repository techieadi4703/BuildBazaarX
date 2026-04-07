import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({
    professional_commission_pct: '',
    designer_commission_pct: '',
    supplier_commission_pct: '',
    gst_pct: '',
    featured_listing_price: '',
    min_payout_amount: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dbSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('platform_settings').select('*');
      if (error && error.code !== '42P01') throw error;
      return data || [];
    }
  });

  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          *,
          profiles:admin_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error && error.code !== '42P01') throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (dbSettings) {
      const newSettings = { ...settings };
      dbSettings.forEach((setting: any) => {
        newSettings[setting.key] = setting.value;
      });
      setSettings(newSettings);
    }
  }, [dbSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('platform_settings').upsert(updates, { onConflict: 'key' });
      if (error) throw error;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('admin_logs').insert({
          admin_id: session.user.id,
          action: 'update_settings',
          target_type: 'platform_settings'
        });
      }
    },
    onSuccess: () => {
      toast({ title: 'Settings saved successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to save settings', description: error.message, variant: 'destructive' });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground">Manage global variables and operational configurations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Financial Configurations</CardTitle>
              <CardDescription>Adjust commissions, taxes, and service fees.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSettings ? (
                <div className="py-8 text-center text-muted-foreground">Loading settings...</div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Professional Commission (%)</Label>
                      <Input 
                        type="number" 
                        value={settings.professional_commission_pct} 
                        onChange={(e) => handleInputChange('professional_commission_pct', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Designer Commission (%)</Label>
                      <Input 
                        type="number" 
                        value={settings.designer_commission_pct} 
                        onChange={(e) => handleInputChange('designer_commission_pct', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Supplier Commission (%)</Label>
                      <Input 
                        type="number" 
                        value={settings.supplier_commission_pct} 
                        onChange={(e) => handleInputChange('supplier_commission_pct', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GST Percentage (%)</Label>
                      <Input 
                        type="number" 
                        value={settings.gst_pct} 
                        onChange={(e) => handleInputChange('gst_pct', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Featured Listing Price (₹)</Label>
                      <Input 
                        type="number" 
                        value={settings.featured_listing_price} 
                        onChange={(e) => handleInputChange('featured_listing_price', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Payout Amount (₹)</Label>
                      <Input 
                        type="number" 
                        value={settings.min_payout_amount} 
                        onChange={(e) => handleInputChange('min_payout_amount', e.target.value)} 
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save All Settings</>}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Admin Activity Log</CardTitle>
              </div>
              <CardDescription>Recent administrative actions across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingLogs ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-4">Loading logs...</TableCell></TableRow>
                    ) : logs?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-4">No recent activity.</TableCell></TableRow>
                    ) : (
                      logs?.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium text-muted-foreground">
                            {log.profiles?.email || 'Unknown Admin'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{log.action?.replace(/_/g, ' ')}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{log.target_type?.replace(/_/g, ' ')}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                            {log.details ? JSON.stringify(log.details) : `ID: ${log.target_id || 'N/A'}`}
                          </TableCell>
                          <TableCell className="text-xs">
                            {format(new Date(log.created_at), 'MMM d, p')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
