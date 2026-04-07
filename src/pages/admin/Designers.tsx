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
import { MoreHorizontal, Search, CheckCircle, XCircle, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function AdminDesigners() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: designers, isLoading } = useQuery({
    queryKey: ['admin-designers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designers')
        .select(`
          *,
          profiles (full_name, is_blocked)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { error } = await supabase.from('designers').update({ is_verified }).eq('id', id);
      if (error) throw error;

      if (is_verified) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from('admin_logs').insert({
            admin_id: session.user.id,
            action: 'verify_designer',
            target_type: 'designer',
            target_id: id
          });
        }
      }
    },
    onSuccess: () => {
      toast({ title: 'Verification status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-designers'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-designers'] });
    },
    onError: (error) => {
      toast({ title: 'Block failed', description: error.message, variant: 'destructive' });
    }
  });

  const filteredData = designers?.filter(designer => {
    if (filterTab === 'pending') {
      if (designer.is_verified) return false;
    } else if (filterTab === 'verified') {
      if (!designer.is_verified) return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = designer.profiles?.full_name?.toLowerCase().includes(term);
      const matchCity = designer.city?.toLowerCase().includes(term);
      return matchName || matchCity;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Designers</h1>
          <p className="text-muted-foreground">Manage platform designers and verify their portfolios.</p>
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
              placeholder="Search by name or city..."
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
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Specializations</TableHead>
                <TableHead>Designs</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredData?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No designers found.</TableCell></TableRow>
              ) : (
                filteredData?.map((designer: any) => (
                  <TableRow key={designer.id}>
                    <TableCell className="font-medium">
                      {designer.profiles?.full_name || 'Unknown'}
                      {designer.profiles?.is_blocked && <Badge variant="destructive" className="ml-2 text-[10px]">Blocked</Badge>}
                    </TableCell>
                    <TableCell>{designer.city || '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {designer.specializations?.slice(0, 2).map((spec: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{spec}</Badge>
                        ))}
                        {designer.specializations?.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{designer.specializations.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{designer.total_designs || 0}</TableCell>
                    <TableCell>
                      <span className="text-yellow-600 font-medium">★ {designer.rating?.toFixed(1) || '0.0'}</span>
                    </TableCell>
                    <TableCell>
                      {designer.is_verified ? (
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
                            <Link to={`/admin/designs?designer_id=${designer.id}`}>
                              <ImageIcon className="mr-2 h-4 w-4" /> View Designs
                            </Link>
                          </DropdownMenuItem>
                          
                          {!designer.is_verified ? (
                            <DropdownMenuItem onClick={() => verifyMutation.mutate({ id: designer.id, is_verified: true })}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Verify
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => verifyMutation.mutate({ id: designer.id, is_verified: false })}>
                              <XCircle className="mr-2 h-4 w-4 text-yellow-600" /> Unverify
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => blockMutation.mutate({ id: designer.id, is_blocked: !designer.profiles?.is_blocked })}
                          >
                            <ShieldAlert className="mr-2 h-4 w-4" /> 
                            {designer.profiles?.is_blocked ? 'Unblock User' : 'Block User'}
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
