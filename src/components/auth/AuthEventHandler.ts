import { AuthChangeEvent } from "@supabase/supabase-js";
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleAuthEvent = (
  event: AuthChangeEvent,
  navigate: NavigateFunction
) => {
  console.log("Auth state changed:", event);
  
  switch (event) {
    case 'SIGNED_IN':
      console.log("User signed in, navigating to home");
      navigate("/");
      break;
    case 'SIGNED_OUT':
      console.log("User signed out");
      navigate("/login");
      break;
    case 'USER_UPDATED':
      console.log("User account updated");
      break;
    case 'TOKEN_REFRESHED':
      console.log("Token refreshed");
      break;
    case 'INITIAL_SESSION':
      console.log("Initial session loaded");
      // Only redirect if we're on the login page and have a session
      if (window.location.pathname === '/login') {
        const checkSession = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log("Active session found, redirecting to home");
            navigate("/");
          }
        };
        checkSession();
      }
      break;
    case 'MFA_CHALLENGE_VERIFIED':
      console.log("MFA challenge verified");
      break;
    default:
      console.log("Unhandled auth event:", event);
  }
};