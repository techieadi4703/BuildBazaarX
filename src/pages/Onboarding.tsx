import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { PORTAL_ROLE, supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Onboarding = () => {
  const { user, hasRole, refreshRoles } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (hasRole(PORTAL_ROLE)) {
    return <Navigate to="/" replace />;
  }

  const handleOnboard = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc("grant_self_role", { p_role: PORTAL_ROLE });
      if (error) throw error;
      
      await refreshRoles();
      toast.success(`Successfully joined BuildBazaarX as a ${PORTAL_ROLE}!`);
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Error onboarding:", error);
      toast.error(error.message || "Failed to add profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-gray-500">
            You're signed in as {user.email}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-600">
            Add a {PORTAL_ROLE} profile to your existing BuildBazaarX account to get started on this portal.
          </p>
          <Button 
            className="w-full" 
            onClick={handleOnboard} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              `Add ${PORTAL_ROLE} Profile`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
