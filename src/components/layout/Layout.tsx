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

        console.log("Session found for user:", session.user.id);

        // Check team membership directly
        console.log("Checking team membership for user:", session.user.id);
        const { data: teamMember, error: teamError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (teamError) {
          console.error("Error checking team membership:", teamError);
          toast.error("Error checking team membership");
          setIsLoading(false);
          return;
        }

        console.log("Team membership result:", teamMember);

        if (!teamMember) {
          console.log("No team membership found, redirecting to no-team");
          if (location.pathname !== '/no-team') {
            navigate("/no-team");
          }
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