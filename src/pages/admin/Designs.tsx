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
import { MoreHorizontal, Search, CheckCircle, XCircle, Trash2, Eye, Flame } from 'lucide-react';
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

export default function AdminDesigns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [searchParams] = useSearchParams();
  const designerIdParam = searchParams.get('designer_id');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: designs, isLoading } = useQuery({
    queryKey: ['admin-designs', designerIdParam],
    queryFn: async () => {
      let query = supabase
        .from('designs')
        .select(`
          *,
          designers (profiles(full_name))
        `)
        .order('created_at', { ascending: false });
        
      if (designerIdParam) {
        query = query.eq('designer_id', designerIdParam);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from('designs').update({ is_published }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Design publish status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-designs'] });
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  });

  const trendingMutation = useMutation({
    mutationFn: async ({ id, is_trending }: { id: string; is_trending: boolean }) => {
      const { error } = await supabase.from('designs').update({ is_trending }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Design trending status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-designs'] });
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('designs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Design deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-designs'] });
    },
    onError: (error) => {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    }
  });

  const filteredData = designs?.filter(d => {
    if (filterTab === 'published' && !d.is_published) return false;
    if (filterTab === 'drafts' && d.is_published) return false;
    if (filterTab === 'trending' && !d.is_trending) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = d.name?.toLowerCase().includes(term);
      // Depending on structure, `designers.profiles.full_name` 
      // Supabase nested joins result in objects or arrays. Assuming singular relation:
      const designerName = d.designers?.profiles?.full_name?.toLowerCase() || '';
      const matchDesigner = designerName.includes(term);
      return matchName || matchDesigner;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Designs</h1>
          <p className="text-muted-foreground">Manage and moderate all design listings.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs defaultValue="all" value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or designer..."
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
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category/Style</TableHead>
                <TableHead>Designer</TableHead>
                <TableHead>Cost (₹)</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredData?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">No designs found.</TableCell></TableRow>
              ) : (
                filteredData?.map((design: any) => {
                  const thumbnail = design.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=48&h=48&fit=crop';
                  return (
                    <TableRow key={design.id}>
                      <TableCell>
                        <img src={thumbnail} alt={design.name} className="w-12 h-12 rounded object-cover border" loading="lazy" decoding="async" />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate" title={design.name}>{design.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="capitalize">{design.category}</span>
                          <span className="text-xs text-muted-foreground capitalize">{design.style}</span>
                        </div>
                      </TableCell>
                      <TableCell>{design.designers?.profiles?.full_name || '—'}</TableCell>
                      <TableCell>{design.total_cost?.toLocaleString() || '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">👁 {design.view_count || 0} views</span>
                          <span className="text-xs text-yellow-600">★ {design.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {design.is_published ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">Published</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Draft</Badge>
                          )}
                          {design.is_trending && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 flex items-center gap-1 text-[10px]">
                              <Flame className="w-3 h-3" /> Trending
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
                            <DropdownMenuItem asChild>
                              <a href={`/designs/db-${design.id}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="mr-2 h-4 w-4" /> Preview
                              </a>
                            </DropdownMenuItem>
                            
                            {!design.is_published ? (
                              <DropdownMenuItem onClick={() => publishMutation.mutate({ id: design.id, is_published: true })}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve / Publish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => publishMutation.mutate({ id: design.id, is_published: false })}>
                                <XCircle className="mr-2 h-4 w-4 text-yellow-600" /> Unpublish
                              </DropdownMenuItem>
                            )}

                            {!design.is_trending ? (
                              <DropdownMenuItem onClick={() => trendingMutation.mutate({ id: design.id, is_trending: true })}>
                                <Flame className="mr-2 h-4 w-4 text-orange-600" /> Mark Trending
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => trendingMutation.mutate({ id: design.id, is_trending: false })}>
                                <XCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Remove Trending
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
                                    This will permanently delete the design "{design.name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMutation.mutate(design.id)} className="bg-destructive hover:bg-destructive/90">
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
