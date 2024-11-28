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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        // Check if user is part of a team
        const { data: teamMembership, error: teamError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', session.user.id)
          .single();

        if (teamError && teamError.code !== 'PGRST116') {
          console.error('Error checking team membership:', teamError);
          toast.error('Failed to check team membership');
          return;
        }

        if (!teamMembership) {
          navigate("/no-team");
          return;
        }

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
        if (!session) {
          navigate("/login");
        } else {
          const { data: teamMembership } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', session.user.id)
            .single();

          if (!teamMembership) {
            navigate("/no-team");
          } else {
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