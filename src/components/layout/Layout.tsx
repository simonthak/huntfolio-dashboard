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
          navigate("/login");
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
          throw new Error("Failed to verify user profile");
        }

        if (!profile) {
          console.log("No profile found for user");
          throw new Error("User profile not found");
        }

        // Verify team membership
        console.log("Verifying team membership...");
        const { data: teamMember, error: teamError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (teamError) {
          console.error("Team membership verification failed:", teamError);
          throw new Error("Could not verify team membership");
        }

        if (!teamMember && location.pathname !== '/no-team') {
          console.log("No team membership found, redirecting to no-team page");
          navigate("/no-team");
          return;
        }

        console.log("Team membership verification complete");

      } catch (error) {
        console.error('Error in checkUser:', error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('An unexpected error occurred');
        }
        
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