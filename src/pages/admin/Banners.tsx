import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Power, PowerOff, Plus, ImageIcon } from 'lucide-react';

export default function AdminBanners() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    position: 'homepage-hero',
    is_active: true,
    sort_order: '0'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('banners').select('*').order('sort_order', { ascending: true });
      if (error && error.code !== '42P01') throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (vars: any) => {
      const payload = {
        ...vars,
        sort_order: Number(vars.sort_order)
      };

      if (editingId) {
        const { error } = await supabase.from('banners').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('banners').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Banner ${editingId ? 'updated' : 'created'} successfully` });
      setIsOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to save banner', description: error.message, variant: 'destructive' });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const { error } = await supabase.from('banners').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Banner status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Banner deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (error) => {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) {
      toast({ title: 'Validation Error', description: 'Title and Image URL are required.', variant: 'destructive' });
      return;
    }
    saveMutation.mutate(formData);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      position: 'homepage-hero',
      is_active: true,
      sort_order: '0'
    });
  };

  const openEdit = (banner: any) => {
    setEditingId(banner.id);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      position: banner.position || 'homepage-hero',
      is_active: banner.is_active,
      sort_order: String(banner.sort_order || 0)
    });
    setIsOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
            <p className="text-muted-foreground">Manage platform promotional and hero banners across pages.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Banner</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <form onSubmit={handleSubmit} className="space-y-4 border-r pr-6">
                  <div className="space-y-2">
                    <Label>Title <span className="text-destructive">*</span></Label>
                    <Input 
                      value={formData.title} 
                      onChange={e => setFormData({ ...formData, title: e.target.value })} 
                      placeholder="e.g. Summer Sale 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input 
                      value={formData.subtitle} 
                      onChange={e => setFormData({ ...formData, subtitle: e.target.value })} 
                      placeholder="e.g. Get up to 50% off on all materials"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL <span className="text-destructive">*</span></Label>
                    <Input 
                      value={formData.image_url} 
                      onChange={e => setFormData({ ...formData, image_url: e.target.value })} 
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Destination Link URL</Label>
                    <Input 
                      value={formData.link_url} 
                      onChange={e => setFormData({ ...formData, link_url: e.target.value })} 
                      placeholder="/materials?category=sale"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={formData.position} onValueChange={v => setFormData({ ...formData, position: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homepage-hero">Homepage Hero</SelectItem>
                        <SelectItem value="homepage-mid">Homepage Mid</SelectItem>
                        <SelectItem value="materials-page">Materials Page</SelectItem>
                        <SelectItem value="designs-page">Designs Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="active" 
                        checked={formData.is_active} 
                        onCheckedChange={v => setFormData({ ...formData, is_active: v })} 
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="space-y-1">
                      <Label>Sort Order</Label>
                      <Input 
                        type="number" 
                        value={formData.sort_order} 
                        onChange={e => setFormData({ ...formData, sort_order: e.target.value })} 
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-6" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : 'Save Banner'}
                  </Button>
                </form>

                {/* Live Preview */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Live Preview</h3>
                  <div className="relative rounded-xl overflow-hidden shadow-md group aspect-[16/9] border flex items-center justify-center bg-white/10 dark:bg-white/5">
                    {formData.image_url ? (
                      <>
                        <img 
                          src={formData.image_url || ''} 
                          alt="Banner Preview" 
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80')}
                        />
                        <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end">
                          <h2 className="text-white text-2xl font-bold mb-1">{formData.title || 'Banner Title'}</h2>
                          {formData.subtitle && <p className="text-white/90 text-sm">{formData.subtitle}</p>}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-sm">Image preview will appear here</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p><strong>Position:</strong> {formData.position}</p>
                    <p><strong>Sort Index:</strong> {formData.sort_order}</p>
                    <p><strong>Link to:</strong> {formData.link_url || 'None'}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border border-white/20 rounded-xl glass overflow-x-auto shadow-glass">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Preview</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : banners?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No banners found.</TableCell></TableRow>
              ) : (
                banners?.map((banner: any) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="w-20 h-10 rounded border overflow-hidden relative">
                        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{banner.title}</div>
                      {banner.subtitle && <div className="text-xs text-muted-foreground">{banner.subtitle}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{banner.position}</Badge>
                    </TableCell>
                    <TableCell>{banner.sort_order}</TableCell>
                    <TableCell>
                      {banner.is_active ? (
                        <Badge variant="secondary" className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 backdrop-blur-sm rounded-full">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-white/10 dark:bg-white/5-foreground/10 border border-muted-foreground/20 text-muted-foreground backdrop-blur-sm rounded-full">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(banner)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleMutation.mutate({ id: banner.id, is_active: !banner.is_active })}
                          title={banner.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {banner.is_active ? <PowerOff className="h-4 w-4 text-muted-foreground" /> : <Power className="h-4 w-4 text-green-600" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (confirm('Delete this banner?')) deleteMutation.mutate(banner.id);
                        }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
