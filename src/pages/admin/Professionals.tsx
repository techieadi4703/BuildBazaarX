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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Search, CheckCircle, XCircle, Eye, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminProfessionals() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [selectedPro, setSelectedPro] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  // Fetch professionals and their related profile for name/blocked status
  const { data: professionals, isLoading } = useQuery({
    queryKey: ['admin-professionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          profiles (full_name, phone, is_blocked)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { error } = await supabase.from('professionals').update({ is_verified }).eq('id', id);
      if (error) throw error;

      if (is_verified && userId) {
        await supabase.from('admin_logs').insert({
            admin_id: userId,
            action: 'verify_professional',
            target_type: 'professional',
            target_id: id
          });
      }
    },
    onSuccess: () => {
      toast({ title: 'Verification status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-professionals'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-professionals'] });
    },
    onError: (error) => {
      toast({ title: 'Block failed', description: error.message, variant: 'destructive' });
    }
  });

  const filteredData = professionals?.filter(pro => {
    // Tab filtering
    if (filterTab === 'pending') {
      if (pro.is_verified) return false;
    } else if (filterTab === 'verified') {
      if (!pro.is_verified) return false;
    } else if (filterTab === 'blocked') {
      if (!pro.profiles?.is_blocked) return false;
    }

    // Search filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = pro.profiles?.full_name?.toLowerCase().includes(term);
      const matchCity = pro.city?.toLowerCase().includes(term);
      const matchProfession = pro.profession?.toLowerCase().includes(term);
      return matchName || matchCity || matchProfession;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Professionals</h1>
          <p className="text-muted-foreground">Manage service professionals, verification, and performance.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs defaultValue="all" value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending Verification</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="blocked">Blocked</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, city or profession..."
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
                <TableHead>Profession</TableHead>
                <TableHead>City & Phone</TableHead>
                <TableHead>Exp. & Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredData?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No professionals found.</TableCell></TableRow>
              ) : (
                filteredData?.map((pro: any) => (
                  <TableRow key={pro.id}>
                    <TableCell className="font-medium">
                      {(pro.full_name || pro.profiles?.full_name) || 'Unknown'}
                      {pro.profiles?.is_blocked && <Badge variant="destructive" className="ml-2 text-[10px]">Blocked</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{pro.profession || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{pro.city || '—'}</span>
                        <span className="text-xs text-muted-foreground">{pro.profiles?.phone || pro.phone || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{pro.experience_years ? `${pro.experience_years} yrs` : '—'}</span>
                        <span className="text-xs text-yellow-600 font-medium">★ {pro.rating?.toFixed(1) || 'New'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {pro.is_verified ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">Verified</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 w-fit">Pending</Badge>
                        )}
                        {pro.is_available ? (
                          <span className="text-[10px] text-green-600 font-medium">Available</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-medium">Unavailable</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(pro.created_at), 'MMM d, yyyy')}</TableCell>
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
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setSelectedPro(pro)}>
                                <Eye className="mr-2 h-4 w-4" /> View Profile
                              </DropdownMenuItem>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Professional Profile</SheetTitle>
                                <SheetDescription>Review details before verifying.</SheetDescription>
                              </SheetHeader>
                              {selectedPro && (
                                <div className="mt-6 space-y-6">
                                  <div>
                                    <h3 className="font-medium text-lg">{selectedPro.full_name || selectedPro.profiles?.full_name}</h3>
                                    <p className="text-muted-foreground">{selectedPro.profession} • {selectedPro.city}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Bio</h4>
                                    <p className="text-sm bg-muted/50 p-3 rounded-md">{selectedPro.bio || 'No bio provided.'}</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground">Experience</h4>
                                      <p>{selectedPro.experience_years} years</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground">Hourly Rate</h4>
                                      <p>{selectedPro.hourly_rate ? `₹${selectedPro.hourly_rate}` : 'N/A'}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedPro.skills?.map((skill: string, i: number) => (
                                        <Badge key={i} variant="outline">{skill}</Badge>
                                      )) || <span className="text-sm">None listed</span>}
                                    </div>
                                  </div>
                                  
                                  <div className="pt-4 border-t flex gap-2">
                                    {!selectedPro.is_verified ? (
                                      <Button className="flex-1" onClick={() => verifyMutation.mutate({ id: selectedPro.id, is_verified: true })}>
                                        Verify Professional
                                      </Button>
                                    ) : (
                                      <Button variant="outline" className="flex-1" onClick={() => verifyMutation.mutate({ id: selectedPro.id, is_verified: false })}>
                                        Remove Verification
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>

                          {!pro.is_verified ? (
                            <DropdownMenuItem onClick={() => verifyMutation.mutate({ id: pro.id, is_verified: true })}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Verify
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => verifyMutation.mutate({ id: pro.id, is_verified: false })}>
                              <XCircle className="mr-2 h-4 w-4 text-yellow-600" /> Unverify
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => blockMutation.mutate({ id: pro.id, is_blocked: !pro.profiles?.is_blocked })}
                          >
                            <ShieldAlert className="mr-2 h-4 w-4" /> 
                            {pro.profiles?.is_blocked ? 'Unblock User' : 'Block User'}
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
