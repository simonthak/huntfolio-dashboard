import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TEAM_OPTIONAL_ROUTES = [
  '/profile', 
  '/settings', 
  '/no-team', 
  '/login',
  '/notifications'
];

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUserAndTeam = async () => {
      try {
        console.log("Starting auth check...");
        
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
          if (isMounted) setIsLoading(false);
          return;
        }

        console.log("User signed in, checking team membership");

        // Only check team membership if we're not on a team-optional route
        if (!TEAM_OPTIONAL_ROUTES.includes(location.pathname)) {
          const { data: teamMemberships, error: teamError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', session.user.id);

          if (teamError) {
            console.error('Error checking team membership:', teamError);
            toast.error('Kunde inte kontrollera lagmedlemskap');
            if (isMounted) setIsLoading(false);
            return;
          }

          if (!teamMemberships?.length) {
            console.log("No team memberships found, redirecting to no-team");
            navigate("/no-team");
            if (isMounted) setIsLoading(false);
            return;
          }
        }

        if (isMounted) setIsLoading(false);
      } catch (error) {
        console.error('Error in checkUserAndTeam:', error);
        toast.error('Ett fel uppstod när din session kontrollerades');
        if (isMounted) setIsLoading(false);
        if (location.pathname !== '/login') {
          navigate("/login");
        }
      }
    };

    // Initial check
    checkUserAndTeam();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        if (location.pathname !== '/login') {
          navigate("/login");
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return { isLoading };
};