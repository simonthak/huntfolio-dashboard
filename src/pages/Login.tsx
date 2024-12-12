import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import { handleAuthError } from "@/components/auth/AuthErrorHandler";
import { handleAuthEvent } from "@/components/auth/AuthEventHandler";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Active session found, redirecting to home");
        navigate("/");
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      handleAuthEvent(event, navigate);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <AuthCard>
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#13B67F',
                brandAccent: '#0ea16f',
              },
            },
          },
          className: {
            container: 'auth-container',
            button: 'auth-button',
            input: 'auth-input',
          },
        }}
        localization={{
          variables: {
            sign_in: {
              email_label: 'E-postadress',
              password_label: 'Lösenord',
              button_label: 'Logga in',
              loading_button_label: 'Loggar in...',
              link_text: 'Har du redan ett konto? Logga in',
            },
            sign_up: {
              email_label: 'E-postadress',
              password_label: 'Lösenord',
              button_label: 'Registrera',
              loading_button_label: 'Registrerar...',
              link_text: 'Har du inget konto? Registrera dig',
            },
            forgotten_password: {
              email_label: 'E-postadress',
              button_label: 'Skicka återställningslänk',
              loading_button_label: 'Skickar...',
              link_text: 'Glömt lösenord?',
            },
          },
        }}
        providers={[]}
        redirectTo={`${window.location.origin}/`}
      />
    </AuthCard>
  );
};

export default Login;