import { toast } from "sonner";

export const handleAuthError = (error: Error) => {
  console.error("Auth error:", error);
  if (error.message.includes("Invalid login credentials")) {
    toast.error("Felaktiga inloggningsuppgifter");
  } else if (error.message.includes("Email not confirmed")) {
    toast.error("E-postadressen har inte bekräftats än");
  } else {
    toast.error("Ett fel uppstod vid inloggningen");
  }
};