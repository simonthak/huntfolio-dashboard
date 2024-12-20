import { AuthChangeEvent } from "@supabase/supabase-js";
import { toast } from "sonner";
import { NavigateFunction } from "react-router-dom";

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
      // Don't navigate if we're already on a valid route
      if (window.location.pathname === '/login') {
        navigate("/");
      }
      break;
    case 'MFA_CHALLENGE_VERIFIED':
      console.log("MFA challenge verified");
      break;
    default:
      console.log("Unhandled auth event:", event);
  }
};