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

        // Check if refresh token exists before attempting refresh
        if (!session.refresh_token) {
          console.log("No refresh token found, signing out...");
          await supabase.auth.signOut();
          if (location.pathname !== '/login') {
            navigate("/login");
          }
          if (isSubscribed) setIsLoading(false);
          return;
        }

        try {
          console.log("Valid refresh token found, attempting to refresh session...");
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshData.session) {
            console.error("Session refresh failed:", refreshError);
            await supabase.auth.signOut();
            if (location.pathname !== '/login') {
              navigate("/login");
            }
            if (isSubscribed) setIsLoading(false);
            return;
          }
          
          console.log("Session refreshed successfully");
        } catch (refreshError) {
          console.error("Error during session refresh:", refreshError);
          await supabase.auth.signOut();
          if (location.pathname !== '/login') {
            navigate("/login");
          }
          if (isSubscribed) setIsLoading(false);
          return;
        }

        console.log("Session valid, checking team membership...");
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