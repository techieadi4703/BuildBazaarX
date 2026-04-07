import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus('denied'); return; }
      const { data: profile, error } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single();
        
      console.log('Admin Check - Session User ID:', session.user.id);
      console.log('Admin Check - Profile Data:', profile);
      console.log('Admin Check - Error if any:', error);
      
      setStatus(profile?.role === 'admin' ? 'allowed' : 'denied');
    };
    check();
  }, []);

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
