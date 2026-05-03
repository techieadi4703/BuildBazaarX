import React, { useState } from 'react';
import { IndianRupee, Landmark, TrendingUp, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface PaymentsTabProps {
  orders: any[];
  settings?: {
    supplierId?: string;
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
  const supplierId = settings?.supplierId;

  const totalEarned = orders.reduce((sum, order) => {
    if (order.status === 'delivered') {
      const supplierItems = Array.isArray(order.items) 
        ? order.items.filter((item: any) => item.supplier_id === supplierId)
        : [];
      const supplierGross = supplierItems.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0);
      const netAmount = supplierGross * (1 - commissionRate);
      return sum + netAmount;
    }
    return sum;
  }, 0);

  const pendingPayout = orders.reduce((sum, order) => {
    if (payoutStatuses.includes(order.status)) {
      const supplierItems = Array.isArray(order.items) 
        ? order.items.filter((item: any) => item.supplier_id === supplierId)
        : [];
      const supplierGross = supplierItems.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0);
      const netAmount = supplierGross * (1 - commissionRate);
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
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-800/60">Total Earned</span>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-headline font-bold text-emerald-600">₹{totalEarned.toLocaleString()}</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-800/60">This Month</span>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-headline font-bold text-blue-600">₹0</p>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-amber-800/60">Pending Payout</span>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-headline font-bold text-amber-600">₹{pendingPayout.toLocaleString()}</p>
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
