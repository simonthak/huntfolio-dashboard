import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/");
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
        />
      </Card>
    </div>
  );
};

export default Login;