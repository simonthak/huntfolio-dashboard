import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Sidebar from "./Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("Checking user session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        console.log("Session found for user:", session.user.id);

        // Check if user is part of a team - simplified query
        const { data: teamMembership, error: teamError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', session.user.id)
          .single();

        console.log("Team membership check result:", { teamMembership, teamError });

        if (teamError && teamError.code !== 'PGRST116') {
          console.error('Error checking team membership:', teamError);
          toast.error('Failed to check team membership');
          return;
        }

        if (!teamMembership) {
          console.log("No team membership found, redirecting to no-team");
          navigate("/no-team");
          return;
        }

        console.log("Team membership found:", teamMembership);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in checkUser:', error);
        toast.error('An error occurred while checking your session');
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (!session) {
          console.log("No session in auth change, redirecting to login");
          navigate("/login");
        } else {
          const { data: teamMembership, error } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', session.user.id)
            .single();

          console.log("Team membership check on auth change:", { teamMembership, error });

          if (!teamMembership) {
            console.log("No team membership found on auth change, redirecting to no-team");
            navigate("/no-team");
          } else {
            console.log("Team membership confirmed on auth change");
            setIsLoading(false);
          }
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
        {children}
      </main>
    </div>
  );
};

export default Layout;