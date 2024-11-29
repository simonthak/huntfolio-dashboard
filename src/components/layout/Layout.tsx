import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Sidebar from "./Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("Starting user session check...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No session found, redirecting to login");
          if (location.pathname !== '/login') {
            navigate("/login");
          }
          return;
        }

        console.log("Valid session found for user:", session.user.id);

        // First check if user has a profile
        console.log("Checking user profile...");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile check failed:", profileError);
          toast.error("Failed to verify user profile");
          return;
        }

        if (!profile) {
          console.log("No profile found for user");
          toast.error("User profile not found");
          return;
        }

        // Then check team membership
        console.log("Checking team membership...");
        const { data: teamMemberships, error: teamError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', session.user.id);

        if (teamError) {
          console.error("Team membership check failed:", teamError);
          toast.error("Failed to verify team membership");
          return;
        }

        if (!teamMemberships || teamMemberships.length === 0) {
          console.log("No team membership found, redirecting to no-team");
          if (location.pathname !== '/no-team') {
            navigate("/no-team");
          }
          return;
        }

        console.log("Team membership verified");

      } catch (error) {
        console.error('Error in checkUser:', error);
        toast.error('Session verification failed');
        if (location.pathname !== '/login') {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to login");
        localStorage.removeItem('activeTeamId');
        navigate("/login");
      } else if (event === 'SIGNED_IN') {
        console.log("User signed in, checking team membership");
        checkUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  if (location.pathname === '/login' || location.pathname === '/no-team') {
    return <main className="flex-1">{children}</main>;
  }

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