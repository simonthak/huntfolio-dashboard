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

        // If we're on the login page and have a session, redirect to home
        if (session && location.pathname === '/login') {
          console.log("User already logged in, redirecting to home");
          navigate("/");
          if (isMounted) setIsLoading(false);
          return;
        }

        // If we don't have a session and we're not on login page, redirect to login
        if (!session && location.pathname !== '/login') {
          console.log("No session found, redirecting to login");
          navigate("/login");
          if (isMounted) setIsLoading(false);
          return;
        }

        // If we have a session and we're not on a team-optional route, check team membership
        if (session && !TEAM_OPTIONAL_ROUTES.includes(location.pathname)) {
          console.log("User signed in, checking team membership");
          
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

    checkUserAndTeam();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      checkUserAndTeam();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return { isLoading };
};