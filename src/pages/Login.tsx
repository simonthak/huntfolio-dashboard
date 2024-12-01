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
            alt="Antlers Logo" 
            className="w-16 h-16 mb-4"
          />
          <h1 className="text-2xl font-bold text-center">Welcome to Antlers</h1>
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
          providers={[]}
          redirectTo={`${window.location.origin}/`}
        />
      </Card>
    </div>
  );
};

export default Login;