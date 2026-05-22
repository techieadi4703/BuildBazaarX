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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Search, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminTickets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === '42P01') return []; // graceful fallback if unmigrated
        throw error;
      }
      return data;
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: number; reply: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          admin_reply: reply, 
          status: 'replied',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Reply sent successfully' });
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
    onError: (error) => {
      toast({ title: 'Failed to send reply', description: error.message, variant: 'destructive' });
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, priority }: { id: number; status?: string; priority?: string }) => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (priority) updates.priority = priority;

      const { error } = await supabase.from('support_tickets').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Ticket updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    }
  });

  const filteredData = tickets?.filter(ticket => {
    // Filter by tab
    if (filterTab === 'urgent' && ticket.priority !== 'urgent') return false;
    if (filterTab !== 'all' && filterTab !== 'urgent' && ticket.status !== filterTab) return false;

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchSubject = ticket.subject?.toLowerCase().includes(term);
      const matchName = ticket.user_name?.toLowerCase().includes(term);
      return matchSubject || matchName;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open': return <Badge variant="destructive" className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 backdrop-blur-sm rounded-full hover:bg-red-100">Open</Badge>;
      case 'replied': return <Badge variant="secondary" className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 backdrop-blur-sm rounded-full hover:bg-blue-100">Replied</Badge>;
      case 'closed': return <Badge variant="outline" className="bg-white/10 dark:bg-white/5-foreground/10 border border-muted-foreground/20 text-muted-foreground backdrop-blur-sm rounded-full">Closed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'urgent') return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Urgent</Badge>;
    return <Badge variant="secondary" className="bg-white/10 dark:bg-white/5-foreground/10 border border-muted-foreground/20 text-muted-foreground backdrop-blur-sm rounded-full">Normal</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Manage user inquiries and support requests.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs defaultValue="open" value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="replied">Replied</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by subject or user..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="border border-white/20 rounded-xl glass overflow-x-auto shadow-glass">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>User / Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredData?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">No tickets found.</TableCell></TableRow>
              ) : (
                filteredData?.map((ticket: any) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium text-muted-foreground">#{ticket.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{ticket.user_name || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">{ticket.user_email || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={ticket.subject}>{ticket.subject}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{format(new Date(ticket.created_at), 'MMM d, yyyy')}</TableCell>
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
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => {
                                setSelectedTicket(ticket);
                                setReplyText(ticket.admin_reply || '');
                              }}>
                                <MessageSquare className="mr-2 h-4 w-4" /> View & Reply
                              </DropdownMenuItem>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                              <SheetHeader>
                                <SheetTitle>Ticket #{selectedTicket?.id}</SheetTitle>
                                <SheetDescription>From: {selectedTicket?.user_name} ({selectedTicket?.user_email})</SheetDescription>
                              </SheetHeader>
                              
                              {selectedTicket && (
                                <div className="mt-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      {getStatusBadge(selectedTicket.status)}
                                      {getPriorityBadge(selectedTicket.priority)}
                                      <span className="text-xs text-muted-foreground ml-auto">{format(new Date(selectedTicket.created_at), 'PPP p')}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{selectedTicket.subject}</h3>
                                    <div className="p-4 bg-white/5 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                                      {selectedTicket.message}
                                    </div>
                                  </div>

                                  <div className="border-t pt-6 flex-1 flex flex-col">
                                    <h4 className="font-medium mb-3">Admin Reply</h4>
                                    {selectedTicket.status === 'closed' && selectedTicket.admin_reply ? (
                                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm whitespace-pre-wrap text-blue-600 dark:text-blue-400">
                                        {selectedTicket.admin_reply}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col h-full gap-4">
                                        <Textarea 
                                          placeholder="Type your response here..." 
                                          className="min-h-[200px] resize-none flex-1"
                                          value={replyText}
                                          onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <div className="flex gap-2 justify-end">
                                          {(selectedTicket.status !== 'closed') && (
                                            <Button 
                                              variant="outline" 
                                              onClick={() => statusMutation.mutate({ id: selectedTicket.id, status: 'closed' })}
                                            >
                                              Close without Reply
                                            </Button>
                                          )}
                                          <Button 
                                            onClick={() => replyMutation.mutate({ id: selectedTicket.id, reply: replyText })}
                                            disabled={!replyText.trim() || replyMutation.isPending}
                                          >
                                            {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>

                          {ticket.status !== 'closed' && (
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: ticket.id, status: 'closed' })}>
                              <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Mark as Closed
                            </DropdownMenuItem>
                          )}
                          
                          {ticket.priority !== 'urgent' && ticket.status !== 'closed' && (
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: ticket.id, priority: 'urgent' })}>
                              <AlertCircle className="mr-2 h-4 w-4 text-destructive" /> Mark Urgent
                            </DropdownMenuItem>
                          )}
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
