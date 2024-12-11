import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        console.log("Checking existing session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check error:", sessionError);
          return;
        }

        if (session) {
          console.log("Active session found, redirecting to home");
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN') {
          console.log("User signed in successfully");
          toast.success("Inloggningen lyckades!");
          navigate("/");
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
        } else if (event === 'USER_DELETED') {
          console.log("User account deleted");
          toast.error("Kontot har tagits bort");
        } else if (event === 'USER_UPDATED') {
          console.log("User account updated");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://nlxlpxddixvieiwsxdbu.supabase.co/storage/v1/object/public/logos/symbol.svg?t=2024-12-01T17%3A04%3A25.353Z" 
            alt="Antlers Logotyp" 
            className="w-16 h-16 mb-4"
          />
          <h1 className="text-2xl font-bold text-center">Välkommen till Antlers</h1>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#13B67F',
                  brandAccent: '#0ea16f',
                }
              }
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: "E-postadress",
                password_label: "Lösenord",
                button_label: "Logga in",
                loading_button_label: "Loggar in...",
                social_provider_text: "Logga in med {{provider}}",
                link_text: "Har du redan ett konto? Logga in",
                email_input_placeholder: "Din e-postadress",
                password_input_placeholder: "Ditt lösenord"
              },
              sign_up: {
                email_label: "E-postadress",
                password_label: "Lösenord",
                button_label: "Registrera",
                loading_button_label: "Registrerar...",
                social_provider_text: "Registrera med {{provider}}",
                link_text: "Har du inget konto? Registrera dig",
                email_input_placeholder: "Din e-postadress",
                password_input_placeholder: "Välj ett lösenord"
              },
              forgotten_password: {
                email_label: "E-postadress",
                password_label: "Lösenord",
                button_label: "Skicka återställningslänk",
                loading_button_label: "Skickar...",
                link_text: "Glömt lösenord?",
                email_input_placeholder: "Din e-postadress"
              },
              update_password: {
                password_label: "Nytt lösenord",
                button_label: "Uppdatera lösenord",
                loading_button_label: "Uppdaterar lösenord...",
                password_input_placeholder: "Ditt nya lösenord"
              }
            }
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/`}
          onError={(error) => {
            console.error("Auth error:", error);
            if (error.message.includes("Invalid login credentials")) {
              toast.error("Felaktiga inloggningsuppgifter");
            } else if (error.message.includes("Email not confirmed")) {
              toast.error("E-postadressen har inte bekräftats än");
            } else {
              toast.error("Ett fel uppstod vid inloggningen");
            }
          }}
        />
      </Card>
    </div>
  );
};

export default Login;