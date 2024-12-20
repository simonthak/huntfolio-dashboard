import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

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
          if (isSubscribed) setIsLoading(false);
          return;
        }

        // Verify the session is still valid
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Session refresh error:", refreshError);
          if (location.pathname !== '/login') {
            navigate("/login");
          }
          if (isSubscribed) setIsLoading(false);
          return;
        }

        console.log("Session found, checking team membership...");
        const { data: teamMemberships, error: teamError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', session.user.id)
          .limit(1)
          .maybeSingle();

        if (teamError) {
          console.error('Error checking team membership:', teamError);
          toast.error('Kunde inte kontrollera lagmedlemskap');
          if (isSubscribed) setIsLoading(false);
          return;
        }

        // If we're on a team-optional route, we don't need to check for team membership
        const TEAM_OPTIONAL_ROUTES = ['/profile', '/settings', '/no-team', '/login', '/notifications'];
        if (!teamMemberships && !TEAM_OPTIONAL_ROUTES.includes(location.pathname)) {
          console.log("No team membership found, redirecting to no-team");
          navigate("/no-team");
        }

        if (isSubscribed) setIsLoading(false);
      } catch (error) {
        console.error('Error in checkUserAndTeam:', error);
        toast.error('Ett fel uppstod när din session kontrollerades');
        if (isSubscribed) setIsLoading(false);
        if (location.pathname !== '/login') {
          navigate("/login");
        }
      }
    };

    // Initial check
    checkUserAndTeam();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log("User signed out or token refreshed");
        if (!session && location.pathname !== '/login') {
          navigate("/login");
        }
      } else if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, checking team membership");
        await checkUserAndTeam();
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return { isLoading };
};