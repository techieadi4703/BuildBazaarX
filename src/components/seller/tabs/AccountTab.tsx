import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, FileText, Settings, ShieldAlert, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccountTabProps {
  profileForm: any;
  setProfileForm: (form: any) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  handleLogout: () => void;
}

export function AccountTab({ profileForm, setProfileForm, handleUpdateProfile, handleLogout }: AccountTabProps) {
  const { toast } = useToast();

  // Calculate completeness
  const fields = ['business_name', 'owner_name', 'phone', 'city', 'address', 'pincode', 'gst_number', 'business_type'];
  const filledFields = fields.filter(f => !!profileForm[f]).length;
  const completeness = Math.round((filledFields / fields.length) * 100);

  const handleDeactivate = () => {
    toast({ title: "Request Received", description: "Our team will contact you within 24 hours to process account deactivation." });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Completeness Meter */}
      <div className="bg-white p-6 rounded-xl border border-[#e5e2df] shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-headline font-semibold text-[#1c1c1a]">Profile Completeness</h3>
            <span className="text-sm font-bold text-[#735c00]">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2 bg-[#fcf9f6] [&>div]:bg-[#735c00]" />
        </div>
        <p className="text-sm text-[#74777d] md:w-64">
          Complete your profile to increase trust and visibility in the marketplace.
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-8">
        
        {/* Section A: Business Details */}
        <div className="bg-white rounded-xl border border-[#e5e2df] shadow-sm overflow-hidden">
          <div className="bg-[#fcf9f6] p-4 border-b border-[#e5e2df] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#735c00]" />
            <h3 className="font-headline font-semibold text-lg">Business Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#74777d]">Business Name *</label>
              <Input 
                value={profileForm.business_name} 
                onChange={e => setProfileForm({...profileForm, business_name: e.target.value})} 
                required 
                className="bg-[#fcf9f6] focus:border-[#735c00] focus:ring-[#735c00]" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#74777d]">Owner Name *</label>
              <Input 
                value={profileForm.owner_name} 
                onChange={e => setProfileForm({...profileForm, owner_name: e.target.value})} 
                required 
                className="bg-[#fcf9f6] focus:border-[#735c00] focus:ring-[#735c00]" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#74777d]">Business Type</label>
              <Select value={profileForm.business_type} onValueChange={v => setProfileForm({...profileForm, business_type: v})}>
                <SelectTrigger className="bg-[#fcf9f6]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="trader">Trader</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="retailer">Retailer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section B: Contact & Location */}
        <div className="bg-white rounded-xl border border-[#e5e2df] shadow-sm overflow-hidden">
          <div className="bg-[#fcf9f6] p-4 border-b border-[#e5e2df] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#735c00]" />
            <h3 className="font-headline font-semibold text-lg">Contact & Location</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#74777d]">Phone Number *</label>
              <Input 
                value={profileForm.phone} 
                onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
                required 
                className="bg-[#fcf9f6]" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#74777d]">City *</label>
              <Input 
                value={profileForm.city} 
                onChange={e => setProfileForm({...profileForm, city: e.target.value})} 
                required 
                className="bg-[#fcf9f6]" 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#74777d]">Full Address</label>
              <Input 
                value={profileForm.address} 
                onChange={e => setProfileForm({...profileForm, address: e.target.value})} 
                className="bg-[#fcf9f6]" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#74777d]">Pincode</label>
              <Input 
                value={profileForm.pincode} 
                onChange={e => setProfileForm({...profileForm, pincode: e.target.value})} 
                className="bg-[#fcf9f6]" 
              />
            </div>
          </div>
        </div>

        {/* Section C: Tax & Compliance */}
        <div className="bg-white rounded-xl border border-[#e5e2df] shadow-sm overflow-hidden">
          <div className="bg-[#fcf9f6] p-4 border-b border-[#e5e2df] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#735c00]" />
            <h3 className="font-headline font-semibold text-lg">Tax & Compliance</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="text-xs font-bold uppercase tracking-wider text-[#74777d]">GST Number</label>
              <div className="flex gap-2">
                <Input 
                  value={profileForm.gst_number} 
                  onChange={e => setProfileForm({...profileForm, gst_number: e.target.value.toUpperCase()})} 
                  className="bg-[#fcf9f6] uppercase flex-1" 
                  placeholder="22AAAAA0000A1Z5"
                />
                <Button type="button" variant="outline" className="shrink-0" onClick={() => toast({ title: "Verification Processed" })}>Verify</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#74777d]">PAN Number</label>
              <Input 
                placeholder="ABCDE1234F"
                className="bg-[#fcf9f6] uppercase" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="bg-[#1c1c1a] hover:bg-[#735c00] text-white px-8">
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 bg-red-50 rounded-xl border border-red-100 p-6">
        <h3 className="font-headline font-semibold text-xl text-red-800 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Danger Zone
        </h3>
        <p className="text-red-600/80 text-sm mb-6 max-w-2xl">
          Actions here are destructive and cannot be easily undone. Please proceed with caution.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="destructive" onClick={handleDeactivate} className="bg-red-600 hover:bg-red-700">
            Deactivate Account
          </Button>
          <Button variant="outline" onClick={handleLogout} className="border-red-200 text-red-600 hover:bg-red-100">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
