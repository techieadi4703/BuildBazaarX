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
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Search, CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
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

const CATEGORIES = [
  "Cement & Aggregates",
  "Bricks & Blocks",
  "Steel & Iron",
  "Wood & Timber",
  "Plumbing & Pipes",
  "Electrical",
  "Paints & Finishes"
];

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchParams] = useSearchParams();
  const supplierIdParam = searchParams.get('supplier_id');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', supplierIdParam],
    queryFn: async () => {
      let query = supabase
        .from('supplier_products')
        .select(`
          *,
          suppliers (profiles(full_name))
        `)
        .order('created_at', { ascending: false });
        
      if (supplierIdParam) {
        query = query.eq('supplier_id', supplierIdParam);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from('supplier_products').update({ is_published }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Product publish status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  });

  const featureMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase.from('supplier_products').update({ is_featured }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Product featured status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('supplier_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Product deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (error) => {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    }
  });

  const filteredData = products?.filter(p => {
    // Tab filter
    if (filterTab === 'published' && !p.is_published) return false;
    if (filterTab === 'drafts' && p.is_published) return false;
    if (filterTab === 'featured' && !p.is_featured) return false;
    if (filterTab === 'out-of-stock' && (p.stock_qty || 0) > 0) return false;

    // Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(term);
      const matchBrand = p.brand?.toLowerCase().includes(term);
      const supplierName = p.suppliers?.profiles?.full_name?.toLowerCase() || '';
      const matchSupplier = supplierName.includes(term);
      return matchName || matchBrand || matchSupplier;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage material catalog and evaluate supplier listings.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs defaultValue="all" value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto overflow-x-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex w-full md:w-auto gap-4 items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Product Info</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Price & Discount</TableHead>
                <TableHead>Stock & Sold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredData?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No products found.</TableCell></TableRow>
              ) : (
                filteredData?.map((product: any) => {
                  const thumbnail = product.images?.[0] || 'https://images.unsplash.com/photo-1542013936693-884638332954?w=48&h=48&fit=crop';
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img src={thumbnail} alt={product.name} className="w-12 h-12 rounded object-cover border" />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-xs">
                          <span className="font-medium truncate" title={product.name}>{product.name}</span>
                          <span className="text-xs text-muted-foreground">{product.brand}</span>
                          <Badge variant="outline" className="w-fit mt-1 text-[10px]">{product.category}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{product.suppliers?.profiles?.full_name || '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">₹{product.price}</span>
                          {product.discount_percent > 0 && (
                            <span className="text-xs text-green-600">{product.discount_percent}% OFF</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={product.stock_qty === 0 ? 'text-destructive font-medium' : ''}>
                            {product.stock_qty} in stock
                          </span>
                          <span className="text-xs text-muted-foreground">{product.total_sold || 0} sold</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {product.is_published ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">Published</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Draft</Badge>
                          )}
                          {product.is_featured && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1 text-[10px]">
                              <Star className="w-3 h-3 fill-blue-600 outline-none border-none" /> Featured
                            </Badge>
                          )}
                        </div>
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
                            {!product.is_published ? (
                              <DropdownMenuItem onClick={() => publishMutation.mutate({ id: product.id, is_published: true })}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve / Publish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => publishMutation.mutate({ id: product.id, is_published: false })}>
                                <XCircle className="mr-2 h-4 w-4 text-yellow-600" /> Unpublish
                              </DropdownMenuItem>
                            )}

                            {!product.is_featured ? (
                              <DropdownMenuItem onClick={() => featureMutation.mutate({ id: product.id, is_featured: true })}>
                                <Star className="mr-2 h-4 w-4 text-blue-600" /> Mark Featured
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => featureMutation.mutate({ id: product.id, is_featured: false })}>
                                <XCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Unfeature
                              </DropdownMenuItem>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the product "{product.name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMutation.mutate(product.id)} className="bg-destructive hover:bg-destructive/90">
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
