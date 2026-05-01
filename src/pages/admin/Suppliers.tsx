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
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Search, CheckCircle, XCircle, ShoppingBag, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSuppliers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: async () => {
      console.log('Fetching suppliers...');
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          *,
          profiles (full_name, is_blocked)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Suppliers Fetch Error:', error);
        throw error;
      }
      return data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { error } = await supabase.from('suppliers').update({ is_verified }).eq('id', id);
      if (error) throw error;

      if (is_verified && userId) {
        await supabase.from('admin_logs').insert({
            admin_id: userId,
            action: 'verify_supplier',
            target_type: 'supplier',
            target_id: id
          });
      }
    },
    onSuccess: () => {
      toast({ title: 'Verification status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, is_blocked }: { id: string; is_blocked: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_blocked }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'User blocked status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
    },
    onError: (error) => {
      toast({ title: 'Block failed', description: error.message, variant: 'destructive' });
    }
  });

  const filteredData = suppliers?.filter(supplier => {
    if (filterTab === 'pending') {
      if (supplier.is_verified) return false;
    } else if (filterTab === 'verified') {
      if (!supplier.is_verified) return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = supplier.business_name?.toLowerCase().includes(term);
      const matchOwner = supplier.profiles?.full_name?.toLowerCase().includes(term);
      const matchCity = supplier.city?.toLowerCase().includes(term);
      return matchName || matchOwner || matchCity;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage material suppliers, business verifications, and inventories.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs defaultValue="all" value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending Verification</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by business, owner or city..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-lg bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading suppliers...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-destructive">Error: {(error as any).message}</TableCell></TableRow>
              ) : filteredData?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">No suppliers found.</TableCell></TableRow>
              ) : (
                filteredData?.map((supplier: any) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      {supplier.business_name || 'Unnamed Business'}
                      {supplier.profiles?.is_blocked && <Badge variant="destructive" className="ml-2 text-[10px]">Blocked</Badge>}
                    </TableCell>
                    <TableCell>{supplier.owner_name || supplier.profiles?.full_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{supplier.city || '—'}</span>
                        <span className="text-xs text-muted-foreground">GST: {supplier.gst_number || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{supplier.business_type || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{supplier.total_products || 0} Products</span>
                        <span className="text-xs text-yellow-600 font-medium">★ {supplier.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.is_verified ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
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
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/products?supplier_id=${supplier.id}`}>
                              <ShoppingBag className="mr-2 h-4 w-4" /> View Products
                            </Link>
                          </DropdownMenuItem>
                          
                          {!supplier.is_verified ? (
                            <DropdownMenuItem onClick={() => verifyMutation.mutate({ id: supplier.id, is_verified: true })}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Verify
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => verifyMutation.mutate({ id: supplier.id, is_verified: false })}>
                              <XCircle className="mr-2 h-4 w-4 text-yellow-600" /> Unverify
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => blockMutation.mutate({ id: supplier.id, is_blocked: !supplier.profiles?.is_blocked })}
                          >
                            <ShieldAlert className="mr-2 h-4 w-4" /> 
                            {supplier.profiles?.is_blocked ? 'Unblock User' : 'Block User'}
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
      </div>
    </AdminLayout>
  );
}
