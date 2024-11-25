import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Sidebar from "./Sidebar";
import { CreateTeamDialog } from "../teams/CreateTeamDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasNoTeam, setHasNoTeam] = useState(false);

  useEffect(() => {
    const checkUserAndTeams = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        // Check if user is a member of any team
        const { data: teamMemberships, error } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('profile_id', session.user.id)
          .limit(1);

        if (error) {
          console.error('Error checking team membership:', error);
          toast.error('Error checking team membership');
          return;
        }

        if (!teamMemberships || teamMemberships.length === 0) {
          setHasNoTeam(true);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error in checkUserAndTeams:', error);
        toast.error('An error occurred while checking your session');
      }
    };

    checkUserAndTeams();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          navigate("/login");
        } else {
          checkUserAndTeams();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        {hasNoTeam && (
          <Alert className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              <span>You are not a member of any hunting team yet.</span>
              <CreateTeamDialog />
            </AlertDescription>
          </Alert>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;