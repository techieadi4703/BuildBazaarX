import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');
  const navigate = useNavigate();
  const { userId, isLoading } = useAuth();

  useEffect(() => {
    const check = async () => {
      if (isLoading) return;
      if (!userId) { setStatus('denied'); return; }
      const { data: profile, error } = await supabase
        .from('profiles').select('role').eq('id', userId).single();
        
      console.log('Admin Check - Session User ID:', userId);
      console.log('Admin Check - Profile Data:', profile);
      console.log('Admin Check - Error if any:', error);
      
      setStatus(profile?.role === 'admin' ? 'allowed' : 'denied');
    };
    void check();
  }, [isLoading, userId]);

  if (status === 'loading') return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (status === 'denied') return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground">Admin access only.</p>
      <Button onClick={() => navigate('/')}>Go Home</Button>
    </div>
  );
  return <>{children}</>;
};
