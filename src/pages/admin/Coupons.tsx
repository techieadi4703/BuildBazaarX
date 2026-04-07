import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminCoupons() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '0',
    max_uses: '100',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error && error.code !== '42P01') throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (vars: any) => {
      const payload = {
        ...vars,
        discount_value: Number(vars.discount_value),
        min_order_value: Number(vars.min_order_value),
        max_uses: Number(vars.max_uses)
      };
      
      if (!payload.valid_from) payload.valid_from = null;
      if (!payload.valid_until) payload.valid_until = null;

      if (editingId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Coupon ${editingId ? 'updated' : 'created'} successfully` });
      setIsOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to save coupon', description: error.message, variant: 'destructive' });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Coupon status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to update', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Coupon deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (error) => {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) {
      toast({ title: 'Validation Error', description: 'Code and Discount Value are required.', variant: 'destructive' });
      return;
    }
    saveMutation.mutate(formData);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '0',
      max_uses: '100',
      valid_from: '',
      valid_until: '',
      is_active: true
    });
  };

  const openEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: String(coupon.discount_value),
      min_order_value: String(coupon.min_order_value || 0),
      max_uses: String(coupon.max_uses || 100),
      valid_from: coupon.valid_from || '',
      valid_until: coupon.valid_until || '',
      is_active: coupon.is_active
    });
    setIsOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
            <p className="text-muted-foreground">Manage platform discounts and promotional codes.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Create Coupon</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Coupon Code <span className="text-destructive">*</span></Label>
                  <Input 
                    value={formData.code} 
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })} 
                    placeholder="e.g. SUMMER24"
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    placeholder="Short summary of this promo"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label>Discount Type</Label>
                  <RadioGroup 
                    value={formData.discount_type} 
                    onValueChange={(v) => setFormData({ ...formData, discount_type: v })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="pct" />
                      <Label htmlFor="pct">Percentage (%)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flat" id="flat" />
                      <Label htmlFor="flat">Flat Amount (₹)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label>Value <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      {formData.discount_type === 'flat' && <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>}
                      <Input 
                        type="number" 
                        className={formData.discount_type === 'flat' ? "pl-7" : "pr-7"}
                        value={formData.discount_value} 
                        onChange={e => {
                          const v = e.target.value;
                          if (formData.discount_type === 'percentage' && Number(v) > 90) return;
                          setFormData({ ...formData, discount_value: v });
                        }}
                      />
                      {formData.discount_type === 'percentage' && <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Order (₹)</Label>
                    <Input 
                      type="number" 
                      value={formData.min_order_value} 
                      onChange={e => setFormData({ ...formData, min_order_value: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maximum Uses</Label>
                    <Input 
                      type="number" 
                      value={formData.max_uses} 
                      onChange={e => setFormData({ ...formData, max_uses: e.target.value })} 
                    />
                  </div>
                  <div className="flex items-center space-x-2 h-full mt-4">
                    <Switch 
                      id="active" 
                      checked={formData.is_active} 
                      onCheckedChange={v => setFormData({ ...formData, is_active: v })} 
                    />
                    <Label htmlFor="active">Active Status</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valid From</Label>
                    <Input 
                      type="date" 
                      value={formData.valid_from} 
                      onChange={e => setFormData({ ...formData, valid_from: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Until</Label>
                    <Input 
                      type="date" 
                      value={formData.valid_until} 
                      onChange={e => setFormData({ ...formData, valid_until: e.target.value })} 
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save Coupon'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : coupons?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">No coupons found.</TableCell></TableRow>
              ) : (
                coupons?.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold tracking-wider">{c.code}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={c.description}>{c.description || '—'}</TableCell>
                    <TableCell>
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                    </TableCell>
                    <TableCell>₹{c.min_order_value || 0}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {c.current_uses || 0} / {c.max_uses}
                    </TableCell>
                    <TableCell>
                      {c.valid_until ? format(new Date(c.valid_until), 'MMM d, yyyy') : 'No Expiry'}
                    </TableCell>
                    <TableCell>
                      {c.is_active ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(c)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => toggleMutation.mutate({ id: c.id, is_active: !c.is_active })}>
                            {c.is_active ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                            {c.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will delete the promo code "{c.code}". Users will no longer be able to use it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(c.id)} className="bg-destructive hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
