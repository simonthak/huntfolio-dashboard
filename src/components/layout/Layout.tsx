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
        console.log("Checking user session and team...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        // Check if user has an active team
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('active_team_id')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error checking profile:', profileError);
          toast.error('Failed to check profile');
          return;
        }

        // If no active team is set, check if user is part of any team
        if (!profile.active_team_id) {
          console.log("No active team, checking team membership...");
          const { data: teamMembership, error: teamError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', session.user.id)
            .limit(1)
            .single();

          if (teamError) {
            if (teamError.code === 'PGRST116') {
              console.log("No team membership found, redirecting to no-team");
              setIsLoading(false);
              navigate("/no-team");
              return;
            }
            console.error('Error checking team membership:', teamError);
            toast.error('Failed to check team membership');
            return;
          }

          console.log("Setting first team as active team...");
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ active_team_id: teamMembership.team_id })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Error setting active team:', updateError);
            toast.error('Failed to set active team');
            return;
          }
        }

        console.log("Team check complete, rendering content");
        setIsLoading(false);
      } catch (error) {
        console.error('Error in checkUser:', error);
        toast.error('An error occurred while checking your session');
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (!session) {
        console.log("No session in auth change, redirecting to login");
        navigate("/login");
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('active_team_id')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error checking profile on auth change:', profileError);
          toast.error('Failed to check profile');
          return;
        }

        if (!profile.active_team_id) {
          const { data: teamMembership, error: teamError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', session.user.id)
            .limit(1)
            .single();

          if (teamError) {
            if (teamError.code === 'PGRST116') {
              console.log("No team membership found on auth change, redirecting to no-team");
              navigate("/no-team");
              return;
            }
            console.error('Error checking team membership on auth change:', teamError);
            toast.error('Failed to check team membership');
            return;
          }

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ active_team_id: teamMembership.team_id })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Error setting active team on auth change:', updateError);
            toast.error('Failed to set active team');
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error in auth change handler:', error);
        toast.error('An error occurred while checking your session');
        setIsLoading(false);
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