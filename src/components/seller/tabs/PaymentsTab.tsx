import React, { useState } from 'react';
import { IndianRupee, Landmark, TrendingUp, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface PaymentsTabProps {
  orders: any[];
  settings?: {
    commissionRate: number;
    payoutStatuses: string[];
  };
}

export function PaymentsTab({ orders, settings }: PaymentsTabProps) {
  const { toast } = useToast();
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ holderName: '', accNumber: '', ifsc: '', bankName: '' });
  
  const commissionRate = settings?.commissionRate ?? 0.10;
  const payoutStatuses = settings?.payoutStatuses ?? ['paid', 'pending', 'processing', 'shipped'];

  const totalEarned = orders.reduce((sum, order) => {
    if (order.status === 'delivered') {
      const netAmount = (order.total || 0) * (1 - commissionRate);
      return sum + netAmount;
    }
    return sum;
  }, 0);

  const pendingPayout = orders.reduce((sum, order) => {
    if (payoutStatuses.includes(order.status)) {
      const netAmount = (order.total || 0) * (1 - commissionRate);
      return sum + netAmount;
    }
    return sum;
  }, 0);

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Feature Coming Soon', description: 'Bank account linking will be available in the next update.' });
    setShowBankForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#735c00] text-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <IndianRupee className="w-5 h-5" />
            <h3 className="font-medium">Total Earned</h3>
          </div>
          <p className="text-4xl font-headline font-bold">₹{totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#e5e2df] shadow-sm">
          <div className="flex items-center gap-2 text-[#74777d] mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-medium">This Month</h3>
          </div>
          <p className="text-4xl font-headline font-bold text-[#1c1c1a]">₹0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#e5e2df] shadow-sm">
          <div className="flex items-center gap-2 text-[#74777d] mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium">Pending Payout</h3>
          </div>
          <p className="text-4xl font-headline font-bold text-[#1c1c1a]">₹{pendingPayout.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bank Account Section */}
        <div className="bg-white border border-[#e5e2df] rounded-xl shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-[#e5e2df] bg-[#fcf9f6]">
            <h3 className="font-headline text-xl font-semibold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#735c00]" /> Bank Account
            </h3>
          </div>
          <div className="p-6">
            {!showBankForm ? (
              <div className="text-center py-8">
                <Landmark className="w-12 h-12 text-[#74777d] opacity-20 mx-auto mb-4" />
                <p className="text-[#1c1c1a] font-medium mb-1">No bank account linked</p>
                <p className="text-sm text-[#74777d] mb-6">Add a bank account to receive payouts directly.</p>
                <Button 
                  onClick={() => setShowBankForm(true)}
                  className="bg-[#1c1c1a] hover:bg-[#735c00] text-white w-full"
                >
                  Add Bank Account
                </Button>
              </div>
            ) : (
              <form onSubmit={handleBankSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#74777d] mb-1 block">Account Holder Name</label>
                  <Input value={bankForm.holderName} onChange={e => setBankForm({...bankForm, holderName: e.target.value})} required className="bg-[#fcf9f6]" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#74777d] mb-1 block">Account Number</label>
                  <Input value={bankForm.accNumber} onChange={e => setBankForm({...bankForm, accNumber: e.target.value})} required className="bg-[#fcf9f6]" type="password" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#74777d] mb-1 block">IFSC Code</label>
                  <Input value={bankForm.ifsc} onChange={e => setBankForm({...bankForm, ifsc: e.target.value})} required className="bg-[#fcf9f6] uppercase" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#74777d] mb-1 block">Bank Name</label>
                  <Input value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} required className="bg-[#fcf9f6]" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowBankForm(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-[#1c1c1a] hover:bg-[#735c00] text-white">Save</Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white border border-[#e5e2df] rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e5e2df] bg-[#fcf9f6]">
            <h3 className="font-headline text-xl font-semibold">Transaction History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-[#74777d]">
                    <div className="flex flex-col items-center justify-center">
                      <IndianRupee className="w-10 h-10 mb-2 opacity-20" />
                      <p>Your payment history will appear here.</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
