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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Search, Settings, ShieldAlert, ShieldCheck, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, roleFilter],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*', { count: 'exact' });
      
      if (roleFilter !== 'all') {
        const dbRole = roleFilter.slice(0, -1); // remove 's' for simple plural matching or just map exactly
        // Let's use exact mapping
        const roleMap: Record<string, string> = {
          customers: 'customer',
          professionals: 'professional',
          designers: 'designer',
          suppliers: 'supplier',
          admins: 'admin'
        };
        query = query.eq('role', roleMap[roleFilter] || roleFilter);
      }
      
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;
      return { users: data, count };
    }
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, is_blocked }: { id: string; is_blocked: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_blocked }).eq('id', id);
      if (error) throw error;

      if (is_blocked) {
        // Also add to admin_logs
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from('admin_logs').insert({
            admin_id: session.user.id,
            action: 'block_user',
            target_type: 'user',
            target_id: id,
            details: { is_blocked: true }
          });
        }
      }
    },
    onSuccess: () => {
      toast({ title: 'User status updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to update user', description: error.message, variant: 'destructive' });
    }
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'User role updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to change role', description: error.message, variant: 'destructive' });
    }
  });

  // Client-side filtering as requested by prompt "Search bar: filter by name or email (client-side filter)"
  const filteredUsers = data?.users?.filter(u => {
    if (!searchTerm) return true;
    const nameMatch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = u.phone?.includes(searchTerm);
    return nameMatch || emailMatch || phoneMatch;
  });

  const totalPages = data?.count ? Math.ceil(data.count / pageSize) : 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage all registered users and their platform access.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs defaultValue="all" value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(1); }} className="w-full md:w-auto overflow-x-auto border rounded-lg p-1 bg-muted/50">
            <TabsList className="bg-transparent border-none h-auto p-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-background">All</TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-background">Customers</TabsTrigger>
              <TabsTrigger value="professionals" className="data-[state=active]:bg-background">Professionals</TabsTrigger>
              <TabsTrigger value="designers" className="data-[state=active]:bg-background">Designers</TabsTrigger>
              <TabsTrigger value="suppliers" className="data-[state=active]:bg-background">Suppliers</TabsTrigger>
              <TabsTrigger value="admins" className="data-[state=active]:bg-background">Admins</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-lg bg-background">
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
              ) : filteredUsers?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No users found.</TableCell></TableRow>
              ) : (
                filteredUsers?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{user.email || '—'}</span>
                        <span className="text-xs text-muted-foreground">{user.phone || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_blocked ? (
                        <Badge variant="destructive" className="flex w-fit items-center gap-1"><ShieldAlert className="h-3 w-3"/> Blocked</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 flex w-fit items-center gap-1"><ShieldCheck className="h-3 w-3" /> Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
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
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>User Details</SheetTitle>
                              </SheetHeader>
                              {selectedUser && (
                                <div className="mt-6 space-y-4">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="font-semibold col-span-1">ID:</div>
                                    <div className="col-span-2 text-sm break-all">{selectedUser.id}</div>
                                    
                                    <div className="font-semibold col-span-1">Name:</div>
                                    <div className="col-span-2">{selectedUser.full_name || 'N/A'}</div>
                                    
                                    <div className="font-semibold col-span-1">Role:</div>
                                    <div className="col-span-2 capitalize">{selectedUser.role || 'customer'}</div>
                                    
                                    <div className="font-semibold col-span-1">Status:</div>
                                    <div className="col-span-2">{selectedUser.is_blocked ? 'Blocked' : 'Active'}</div>
                                    
                                    <div className="font-semibold col-span-1">Joined:</div>
                                    <div className="col-span-2">{format(new Date(selectedUser.created_at), 'PPP')}</div>
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>
                          
                          <DropdownMenuItem onClick={() => roleMutation.mutate({ id: user.id, role: user.role === 'admin' ? 'customer' : 'admin' })}>
                            <Settings className="mr-2 h-4 w-4" /> 
                            {user.role === 'admin' ? 'Make Customer' : 'Make Admin'}
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                            className={user.is_blocked ? 'text-green-600 focus:text-green-600' : 'text-destructive focus:text-destructive'}
                            onClick={() => blockMutation.mutate({ id: user.id, is_blocked: !user.is_blocked })}
                          >
                            {user.is_blocked ? <ShieldCheck className="mr-2 h-4 w-4" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                            {user.is_blocked ? 'Unblock User' : 'Block User'}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
