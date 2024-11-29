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
        console.log("Checking user session...");
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

        console.log("Session found, checking team membership for user:", session.user.id);
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select(`
            team_id,
            teams (
              id,
              name
            )
          `)
          .eq('user_id', session.user.id);

        if (teamError) {
          console.error('Error checking team membership:', teamError);
          toast.error('Error checking team membership. Please try again.');
          setIsLoading(false);
          return;
        }

        console.log("Team membership query result:", teamMembers);

        if (!teamMembers || teamMembers.length === 0) {
          console.log("No team membership found, redirecting to no-team");
          if (location.pathname !== '/no-team') {
            navigate("/no-team");
          }
          setIsLoading(false);
          return;
        }

        const teamMember = teamMembers[0];
        if (!teamMember?.team_id) {
          console.error("Invalid team membership data:", teamMember);
          toast.error('Invalid team data. Please try rejoining your team.');
          if (location.pathname !== '/no-team') {
            navigate("/no-team");
          }
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error in checkUser:', error);
        toast.error('An error occurred while checking your session');
        setIsLoading(false);
        if (location.pathname !== '/login') {
          navigate("/login");
        }
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to login");
        navigate("/login");
      } else if (event === 'SIGNED_IN') {
        console.log("User signed in, checking team membership");
        checkUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Don't show sidebar on login page
  if (location.pathname === '/login') {
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