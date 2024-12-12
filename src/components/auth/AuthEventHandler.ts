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
      console.log("User signed in");
      navigate("/");
      break;
    case 'SIGNED_OUT':
      console.log("User signed out");
      break;
    case 'USER_UPDATED':
      console.log("User account updated");
      break;
    case 'TOKEN_REFRESHED':
      console.log("Token refreshed");
      break;
    case 'MFA_CHALLENGE_VERIFIED':
      console.log("MFA challenge verified");
      break;
    default:
      console.log("Unhandled auth event:", event);
  }
};