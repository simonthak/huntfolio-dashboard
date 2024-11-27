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
        <h1 className="text-2xl font-bold text-center mb-8">Welcome to Project Antlers</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#13B67F',
                  brandAccent: '#13B67F',
                }
              }
            }
          }}
          providers={["google"]}
          redirectTo={`${window.location.origin}/`}
          options={{
            emailRedirectTo: `${window.location.origin}/`,
            meta: {
              fields: [
                {
                  name: 'firstname',
                  type: 'text',
                  required: true,
                  label: 'First Name',
                },
                {
                  name: 'lastname',
                  type: 'text',
                  required: true,
                  label: 'Last Name',
                },
                {
                  name: 'phone_number',
                  type: 'tel',
                  required: true,
                  label: 'Phone Number',
                },
              ],
            },
          }}
        />
      </Card>
    </div>
  );
};

export default Login;