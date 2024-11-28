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

        console.log("Session found, checking profile...");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('active_team_id')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error checking profile:', profileError);
          toast.error('Failed to check profile');
          setIsLoading(false);
          return;
        }

        if (!profile.active_team_id) {
          console.log("No active team, checking team membership...");
          const { data: teamMembership, error: teamError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', session.user.id)
            .limit(1);

          if (teamError) {
            console.error('Error checking team membership:', teamError);
            toast.error('Failed to check team membership');
            setIsLoading(false);
            return;
          }

          if (!teamMembership || teamMembership.length === 0) {
            console.log("No team membership found, redirecting to no-team");
            setIsLoading(false);
            navigate("/no-team");
            return;
          }

          // Set first team as active
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ active_team_id: teamMembership[0].team_id })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Error setting active team:', updateError);
            toast.error('Failed to set active team');
            setIsLoading(false);
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error in checkUser:', error);
        toast.error('An error occurred while checking your session');
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to login");
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13B67F]"></div>
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