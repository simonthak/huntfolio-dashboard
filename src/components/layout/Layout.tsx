import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Sidebar from "./Sidebar";

// Pages that don't require automatic team selection
const TEAM_OPTIONAL_ROUTES = ['/teams', '/no-team', '/login'];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserAndTeam = async () => {
      try {
        console.log("Checking user session and team membership...");
        
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
          setIsLoading(false);
          return;
        }

        console.log("Session found, checking team membership...");
        const { data: teamMemberships, error: teamError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', session.user.id);

        if (teamError) {
          console.error('Error checking team membership:', teamError);
          toast.error('Failed to check team membership');
          setIsLoading(false);
          return;
        }

        if (!teamMemberships || teamMemberships.length === 0) {
          console.log("No team membership found, redirecting to no-team");
          navigate("/no-team");
          setIsLoading(false);
          return;
        }

        // Only set default team if we're not on a team-optional route and no team is selected
        if (!searchParams.get('team') && !TEAM_OPTIONAL_ROUTES.includes(location.pathname)) {
          console.log("No team selected, selecting first team:", teamMemberships[0].team_id);
          navigate(`${location.pathname}?team=${teamMemberships[0].team_id}`);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error in checkUserAndTeam:', error);
        toast.error('An error occurred while checking your session');
        setIsLoading(false);
        navigate("/login");
      }
    };

    checkUserAndTeam();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to login");
        navigate("/login");
      } else if (event === 'SIGNED_IN') {
        console.log("User signed in, checking team membership");
        checkUserAndTeam();
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

  // Don't show the "No Team Selected" message on team-optional routes
  if (!searchParams.get('team') && !TEAM_OPTIONAL_ROUTES.includes(location.pathname)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">No Team Selected</h2>
          <p className="text-gray-600">Please select a team from the sidebar to continue</p>
        </div>
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